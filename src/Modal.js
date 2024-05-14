// src/Modal.js
import React from "react";
import Modal from "react-modal";

const ImageModal = ({ isOpen, onRequestClose, imageSrc }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={{
        content: {
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        },
      }}
    >
      <img
        src={imageSrc}
        alt="Enlarged"
        style={{ maxHeight: "90vh", maxWidth: "90vw" }}
      />
    </Modal>
  );
};

export default ImageModal;
