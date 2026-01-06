import { createUploadthing, type FileRouter } from "uploadthing/next";
 
const f = createUploadthing();
 
export const ourFileRouter = {
  // Define a route for "Commercial Docs"
  commercialDoc: f({ 
      // 1. PDF Documents (Standard)
      pdf: { maxFileSize: "16MB", maxFileCount: 1 }, 
      
      // 2. Images (Scanned docs)
      image: { maxFileSize: "8MB", maxFileCount: 1 },
      
      // 3. Text Files (CSV, TXT)
      text: { maxFileSize: "8MB", maxFileCount: 1 },

      // 4. General "Blob" for Office Files (.doc, .docx, .xls, .xlsx)
      // We set this to 16MB. Most videos are larger than this, 
      // acting as a soft-block for video files.
      blob: { maxFileSize: "16MB", maxFileCount: 1 } 
  })
    .onUploadComplete(async ({ file }) => {
      console.log("Upload complete:", file.url);
    }),
} satisfies FileRouter;
 
export type OurFileRouter = typeof ourFileRouter;