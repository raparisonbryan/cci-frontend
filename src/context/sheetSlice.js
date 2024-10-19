import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchSheetData = createAsyncThunk(
  "sheet/fetchSheetData",
  async ({ spreadsheetId, range }) => {
    const response = await axios.get("http://localhost:3000/sheets/data", {
      params: { spreadsheetId, range },
    });
    return response.data;
  }
);

export const updateSheetData = createAsyncThunk(
  "sheet/updateSheetData",
  async ({ spreadsheetId, range, values }) => {
    const response = await axios.post("http://localhost:3000/sheets/data", {
      spreadsheetId,
      range,
      values,
    });
    return response.data;
  }
);

const sheetSlice = createSlice({
  name: "sheet",
  initialState: {
    data: [],
    status: "idle",
    error: null,
  },
  reducers: {
    updateCell: (state, action) => {
      const { rowIndex, cellIndex, value } = action.payload;
      state.data[rowIndex][cellIndex] = value;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSheetData.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchSheetData.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
      })
      .addCase(fetchSheetData.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(updateSheetData.fulfilled, (state, action) => {
        // Optionally handle additional logic after successful update
      });
  },
});

export const { updateCell } = sheetSlice.actions;

export default sheetSlice.reducer;
