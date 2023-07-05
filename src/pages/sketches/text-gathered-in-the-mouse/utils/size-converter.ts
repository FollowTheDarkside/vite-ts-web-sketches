export function convertSizeTo3dView(aspectRatio: number, fov: number, camPosZ: number, lightPosZ: number){
    const heightOnOrigin = (Math.tan(((fov * Math.PI / 180) / 2)) * (camPosZ - lightPosZ) * 2)
    const widthOnOrigin = heightOnOrigin * aspectRatio
    return {widthOnOrigin, heightOnOrigin}
}