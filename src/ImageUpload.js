import React, { useState, useEffect } from "react";
import axios from "axios";
import ImageModal from "./Modal";
import Modal from "react-modal";

Modal.setAppElement("#root"); // Set the root element for accessibility

const ImageUpload = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [categories, setCategories] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImageSrc, setModalImageSrc] = useState("");
  const [galleryImages, setGalleryImages] = useState([]);

  useEffect(() => {
    fetchGalleryImages();
  }, []);

  const fetchGalleryImages = async () => {
    try {
      const response = await axios.get("http://localhost:5000/images");
      setGalleryImages(response.data);
    } catch (error) {
      console.error("Error fetching gallery images:", error.message);
    }
  };

  const handleImageChange = (e) => {
    setSelectedImage(e.target.files[0]);
    console.log("Image selected:", e.target.files[0]);
  };

  const handleImageUpload = async () => {
    if (!selectedImage) {
      console.log("No image selected");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(selectedImage);
    reader.onloadend = async () => {
      const base64Image = reader.result.split(",")[1];
      console.log("Base64 image:", base64Image);

      try {
        const visionResponse = await axios.post(
          `https://vision.googleapis.com/v1/images:annotate?key=YOUR_API_KEY`,
          {
            requests: [
              {
                image: {
                  content: base64Image,
                },
                features: [
                  {
                    type: "LABEL_DETECTION",
                    maxResults: 10,
                  },
                ],
              },
            ],
          }
        );

        const labels = visionResponse.data.responses[0].labelAnnotations.map(
          (label) => label.description
        );
        console.log("API response:", visionResponse.data);

        const formData = new FormData();
        formData.append("image", selectedImage);
        formData.append("categories", JSON.stringify(labels));

        await axios.post("http://localhost:5000/upload", formData);

        setCategories(labels);
        fetchGalleryImages(); // Refresh the gallery after uploading a new image
      } catch (error) {
        if (error.response) {
          console.error("Error response:", error.response.data);
        } else {
          console.error("Error categorizing image:", error.message);
        }
      }
    };

    reader.onerror = (error) => {
      console.error("Error reading file:", error);
    };
  };

  const handleSearch = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/search?category=${searchQuery}`
      );
      setSearchResults(response.data);
    } catch (error) {
      console.error("Error searching images:", error.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/delete/${id}`);
      setSearchResults(searchResults.filter((result) => result.id !== id));
      setGalleryImages(galleryImages.filter((image) => image.id !== id));
    } catch (error) {
      console.error("Error deleting image:", error.message);
    }
  };

  const openModal = (imageSrc) => {
    setModalImageSrc(imageSrc);
    setIsModalOpen(true);
  };

  return (
    <div>
      <input type="file" onChange={handleImageChange} />
      <button onClick={handleImageUpload}>Upload and Categorize</button>
      {categories.length > 0 && (
        <div>
          <h3>Categories:</h3>
          <ul>
            {categories.map((category, index) => (
              <li key={index}>{category}</li>
            ))}
          </ul>
        </div>
      )}
      <div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by category"
        />
        <button onClick={handleSearch}>Search</button>
      </div>
      {searchResults.length > 0 && (
        <div>
          <h3>Search Results:</h3>
          <ul>
            {searchResults.map((result, index) => (
              <li key={index}>
                <img
                  src={`http://localhost:5000/uploads/${result.filename}`}
                  alt={result.filename}
                  style={{ width: "100px", cursor: "pointer" }}
                  onClick={() =>
                    openModal(
                      `http://localhost:5000/uploads/${result.filename}`
                    )
                  }
                />
                <p>Categories: {result.categories.join(", ")}</p>
                <button onClick={() => handleDelete(result.id)}>Delete</button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <h3>Gallery</h3>
      <div className="gallery">
        {galleryImages.map((image) => (
          <div key={image.id} className="gallery-item">
            <img
              src={`http://localhost:5000/uploads/${image.filename}`}
              alt={image.filename}
              style={{ width: "100px", cursor: "pointer" }}
              onClick={() =>
                openModal(`http://localhost:5000/uploads/${image.filename}`)
              }
            />
            <button onClick={() => handleDelete(image.id)}>Delete</button>
          </div>
        ))}
      </div>
      <ImageModal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        imageSrc={modalImageSrc}
      />
    </div>
  );
};

export default ImageUpload;
