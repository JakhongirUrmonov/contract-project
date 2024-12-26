'use client';

import React from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import {
  defaultLayoutPlugin,
  ToolbarProps,
  ToolbarSlot,
} from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import styles from './PDFPreview.module.css'; // Import CSS module

// Import icons from React Icons (Heroicons)
import { HiOutlineZoomIn, HiOutlineZoomOut } from 'react-icons/hi';

type PDFPreviewProps = {
  fileUrl: string;
};

// Define the custom toolbar function
const renderToolbar = (
  Toolbar: (props: ToolbarProps) => React.ReactElement
) => (
  <Toolbar>
    {(slots: ToolbarSlot) => {
      const {
        ZoomOut,
        ZoomIn,
        GoToPreviousPage,
        GoToNextPage,
        CurrentPageInput,
        NumberOfPages,
      } = slots;

      return (
        <div className={styles.toolbar}>
          {/* Left Section: Zoom Controls */}
          <div className={styles.toolbarSection}>
            {/* Zoom In Button */}
            <div className={styles.toolbarItem}>
              <ZoomIn>
                {(props) => (
                  <button
                    className={`${styles.toolbarButton} btn btn-ghost btn-sm rounded-md`}
                    onClick={props.onClick}
                    aria-label="Zoom In"
                  >
                    <HiOutlineZoomIn className={styles.icon} />
                  </button>
                )}
              </ZoomIn>
            </div>
            {/* Zoom Out Button */}
            <div className={styles.toolbarItem}>
              <ZoomOut>
                {(props) => (
                  <button
                    className={`${styles.toolbarButton} btn btn-ghost btn-sm rounded-md`}
                    onClick={props.onClick}
                    aria-label="Zoom Out"
                  >
                    <HiOutlineZoomOut className={styles.icon} />
                  </button>
                )}
              </ZoomOut>
            </div>
          </div>
          {/* <div className={styles.toolbarSection}>
            <span className="opacity-80 leading-relaxed pt-3">Bohdan_Levishchenko_-_Product_Designer.pdf</span>
          </div>   */}
          {/* Right Section: Pagination Controls */}
          <div className={styles.toolbarSection}>
            {/* Go To Previous Page */}
            <div className={styles.toolbarItem}>
              <span className="opacity-80 leading-relaxed">Page</span>
              {/* <GoToPreviousPage>
                {(props) => (
                  <button
                    className={`${styles.toolbarButton} btn btn-secondary btn-sm`}
                    onClick={props.onClick}
                    aria-label="Previous Page"
                  >
                    Previous
                  </button>
                )}
              </GoToPreviousPage> */}
            </div>

            {/* Current Page Input */}
            <div className={styles.toolbarItem}>
              <CurrentPageInput />
            </div>

            {/* Number of Pages */}
            <div className={styles.toolbarItem}>
              of <NumberOfPages />
            </div>

            {/* Go To Next Page */}
            {/* <div className={styles.toolbarItem}>
              <GoToNextPage>
                {(props) => (
                  <button
                    className={`${styles.toolbarButton} btn btn-secondary btn-sm`}
                    onClick={props.onClick}
                    aria-label="Next Page"
                  >
                    Next
                  </button>
                )}
              </GoToNextPage>
            </div> */}
          </div>
        </div>
      );
    }}
  </Toolbar>
);

const PDFPreview: React.FC<PDFPreviewProps> = ({ fileUrl }) => {
  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    renderToolbar,
    sidebarTabs: (defaultTabs) => [], // Disable the sidebar by removing all sidebar tabs
  });

  if (!fileUrl) {
    return <p>No file to display.</p>;
  }

  return (
    <div className="card bg-base-200 border-b border-gray-200">
      <div className="card-body p-0">
        <div className="h-[750px] overflow-hidden bg-gray-100">
          <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`}>
            <Viewer
              fileUrl={fileUrl}
              plugins={[defaultLayoutPluginInstance]}
            />
          </Worker>
        </div>
      </div>
    </div>
  );
};

export default PDFPreview;