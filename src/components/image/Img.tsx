import Image from "next/image"
import {Property} from "csstype";
import ObjectFit = Property.ObjectFit;

export interface ImgProps {
    src: string;
    height?: number;
    width?: number;
    objectFit?: ObjectFit;
    alt: string;
}

const Img = (props: ImgProps) => {
    return (
        <div style={{position: "relative", height: props.height, width: props.width}}>
            <Image
                fill
                src={props.src}
                style={props.objectFit ? { objectFit: props.objectFit } : undefined}
                alt={props.alt}/>
        </div>
    )
}

export default Img;