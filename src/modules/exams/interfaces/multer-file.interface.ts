/**
 * Interface representing a file uploaded via Multer
 */
export interface MulterFile {
  /** Field name specified in the form */
  fieldname: string;
  
  /** Name of the file on the user's computer */
  originalname: string;
  
  /** Encoding type of the file */
  encoding: string;
  
  /** Mime type of the file */
  mimetype: string;
  
  /** Size of the file in bytes */
  size: number;
  
  /** The Buffer of the entire file */
  buffer: Buffer;
  
  /** The folder to which the file has been saved (DiskStorage) */
  destination?: string;
  
  /** The name of the file within the destination (DiskStorage) */
  filename?: string;
  
  /** The full path to the uploaded file (DiskStorage) */
  path?: string;
}
