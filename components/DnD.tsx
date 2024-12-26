// DnD.tsx

"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { DocumentArrowUpIcon } from "@heroicons/react/24/outline";
import { FlagIcon } from "@heroicons/react/24/outline";

export default function DnD() {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const router = useRouter();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      const fileList = Array.from(e.target.files);
      setFiles(fileList);
      handleSubmitFile(fileList); // Pass fileList directly
    }
  }

  async function handleSubmitFile(fileList: File[]) {
    setUploading(true);
    const formData = new FormData();
    fileList.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Upload successful", data);

        if (data.files && data.files.length > 0) {
          const fileUrl = data.files[0].url;
          // Redirect to /review-contract with the fileUrl as a query parameter
          router.push(
            `/review-contract?fileUrl=${encodeURIComponent(fileUrl)}`
          );
        }
      } else {
        const errorData = await response.json();
        console.error("Upload error:", errorData.error);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent<HTMLFormElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files) {
      const fileList = Array.from(e.dataTransfer.files);
      setFiles(fileList);
      handleSubmitFile(fileList); // Pass fileList directly
    }
  }

  function handleDragOver(e: React.DragEvent<HTMLFormElement>) {
    e.preventDefault();
    e.stopPropagation();
  }

  function openFileExplorer() {
    inputRef.current?.click();
  }

  return (
    <div className="max-w-7xl mx-auto bg-base-100 flex items-center justify-center px-4 sm:px-8 lg:px-40 py-8">
      <form
        className={`${
          dragActive ? "bg-base-400" : "bg-base-100"
        } w-full text-center flex flex-col items-center justify-center rounded-md gap-4 border-2 border-primary p-3 md:p-2 transition-colors duration-300`}
        onDragEnter={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragActive(true);
        }}
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmitFile(files);
        }}
        onDrop={handleDrop}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragActive(false);
        }}
        onDragOver={handleDragOver}
      >
        <input
          className="hidden"
          ref={inputRef}
          type="file"
          multiple
          onChange={handleChange}
          accept="application/pdf"
        />
        <div className="flex flex-col items-center w-full">
          <div className="flex flex-col items-center space-y-4">
            {files.length > 0 ? (
              <>
                {files[0].name}
                {uploading && (
                  <span className="loading loading-spinner loading-xs ml-2"></span>
                )}
              </>
            ) : (
              <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 text-md">
                <DocumentArrowUpIcon className="h-6 w-6 mx-2" />
                <span className="lg:pr-6 text-md">
                  <a
                    onClick={openFileExplorer}
                    className="text-primary font-bold cursor-pointer"
                  >
                    Choose .pdf
                  </a>{" "}
                  contract and get instant red flags
                </span>
                <button
                  type="button"
                  className="btn btn-primary flex items-center px-4 py-2"
                  onClick={openFileExplorer}
                >
                  {/* <FlagIcon className="h-6 w-6 mr-2" /> */}
                  Scan for red flags
                </button>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
