/**
 * Receives a list of imageids possibly referring to multiframe dicom images
 * and returns a list of imageid where each imageid referes to one frame.
 * For each imageId representing a multiframe image with n frames,
 * it will create n new imageids, one for each frame, and returns the new list of imageids
 * If a particular imageid no refer to a mutiframe image data, it will be just copied into the new list
 * @returns new list of imageids where each imageid represents a frame
 */
export function convertMultiframeImageIds(imageIds: any): any[];
/**
 * preloads imageIds metadata in memory
 **/
export function prefetchMetadataInformation(imageIdsToPrefetch: any): Promise<void>;
