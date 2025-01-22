import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

interface FetchSheetDataArgs {
  spreadsheetId: string;
  range: string;
}

interface UpdateSheetDataArgs {
  spreadsheetId: string;
  range: string;
  values: string[][];
}

interface SheetState {
  data: string[][];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

export const fetchSheetData = createAsyncThunk(
  "sheet/fetchSheetData",
  async ({ spreadsheetId, range }: FetchSheetDataArgs) => {
    const response = await axios.get("http://localhost:3000/sheets/data", {
      params: { spreadsheetId, range },
    });
    return response.data;
  }
);

export const updateSheetData = createAsyncThunk(
  "sheet/updateSheetData",
  async ({ spreadsheetId, range, values }: UpdateSheetDataArgs) => {
    const response = await axios.post("http://localhost:3000/sheets/data", {
      spreadsheetId,
      range,
      values,
    });
    return response.data;
  }
);

const initialState: SheetState = {
  data: [],
  status: "idle",
  error: null,
};

const sheetSlice = createSlice({
  name: "sheet",
  initialState,
  reducers: {
    updateCell: (state, action: PayloadAction<{ rowIndex: number; cellIndex: number; value: string }>) => {
      const { rowIndex, cellIndex, value } = action.payload;
      state.data[rowIndex][cellIndex] = value;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSheetData.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchSheetData.fulfilled, (state, action: PayloadAction<string[][]>) => {
        state.status = "succeeded";
        state.data = action.payload;
      })
      .addCase(fetchSheetData.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      })
      .addCase(updateSheetData.fulfilled, (state, action: PayloadAction<string[][]>) => {
        // Optionally handle additional logic after successful update
      });
  },
});

export const { updateCell } = sheetSlice.actions;

export default sheetSlice.reducer;