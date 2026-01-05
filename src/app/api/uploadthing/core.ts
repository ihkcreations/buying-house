import { createUploadthing, type FileRouter } from "uploadthing/next";
 
const f = createUploadthing();
 
export const ourFileRouter = {
  // Define a route for "Commercial Docs"
  commercialDoc: f({ pdf: { maxFileSize: "4MB", maxFileCount: 1 }, image: { maxFileSize: "4MB" } })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", file.url);
      // You can do server-side logic here if needed
    }),
} satisfies FileRouter;
 
export type OurFileRouter = typeof ourFileRouter;