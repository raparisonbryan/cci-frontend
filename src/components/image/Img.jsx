import Image from "next/image"

export default function Img({ src, height, width, objectFit }) {
    return (
        <div style={{position: "relative", height: height, width: width}}>
            <Image fill src={src} style={{objectFit:`${objectFit}`}}/>
        </div>
    )
}