import React, { useState, useEffect, useRef, useCallback } from "react";
import './RandomQuoteGenerator.css';
import { ReactComponent as LoadingIcon } from './svgloading.svg';
import html2canvas from "html2canvas";

const RandomQuoteGenerator = () => {

  const [quote, setQuotes] = useState("");
  const [author, setAuthor] = useState("");
  const [newQuote, setNewQuote] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [addQuote, setAddQuote] = useState("");
  const [bgColor, setBgColor] = useState("#ffffff");
  const quoteRef = useRef(null);


  // Function to generate a random background color
  const getRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  //Fetch Random Quote
  const fetchRandomQuotes = useCallback(async () => {

    setLoading(true);
    setError("");

    try {
      const response = await fetch("https://weirdrichapi.onrender.com/api/quotes/random");
      const data = await response.json();
      setQuotes(data.quoteText);
      setAuthor(data.author);
      setBgColor(getRandomColor());
    } catch (error) {
      setQuotes("");
      setAuthor("");
      setError("Failed to load quote. Please try again.")
    } finally {
      setLoading(false);
    }
  }, []);

  //Add New Quote
  const addNewQuotes = async (e) => {

    e.preventDefault();
    setError("");
    setSuccessMessage("");

    try {
      const response = await fetch("https://weirdrichapi.onrender.com/api/quotes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quoteText: newQuote, author: newAuthor }),
      });

      if (response.ok) {
        setNewQuote("");
        setNewAuthor("");
        setAddQuote(false);
        alert("Quote added successfully!");
      } else {
        throw new Error("Failed to add the quote.");
      }
    } catch (error) {
      setError("Could not add the quote. Please try again.");
    }
  };

  // Share Quote as Image (Convert to Image using html2canvas)
  const shareQuoteAsImage = () => {
    if (quoteRef.current) {
      html2canvas(quoteRef.current, {
        backgroundColor: null,  // Transparent background
        scale: 2,  // Increase the scale for better quality
      }).then((canvas) => {
        const ctx = canvas.getContext("2d");
        const text = "From weirdrichapi.com";  // Watermark text
        const fontSize = 24; // Smaller font size for watermark

        // Measure the watermark text width
        ctx.font = `${fontSize}px Arial`;
        const textWidth = ctx.measureText(text).width;
        const textHeight = fontSize;  // Approximate height of the

        // Calculate the position of the watermark at the bottom center
        const x = (canvas.width - textWidth) / 2;
        const y = canvas.height - textHeight - 15;

        // Set the font and style for the watermark
        ctx.font = `${fontSize}px Arial`;
        ctx.fillStyle = "rgba(249, 249, 249, 0.7)"; // Higher opacity for better visibility

        // Draw the watermark at the bottom center of the canvas
        ctx.fillText(text, x, y);

        // Convert the canvas to image and trigger download
        const imageUrl = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = imageUrl;
        link.download = "quote.png";
        link.click(); // Trigger the download
      });
    }
  };

  useEffect(() => {
    fetchRandomQuotes(); // Initial call
    const interval = setInterval(() => {
      fetchRandomQuotes();
    }, 15000); // 15 seconds interval
  
    return () => clearInterval(interval); // Cleanup on unmount
  }, [fetchRandomQuotes]);

  return (
    <div className="RandomQuoteContainer">
      <div className="RandomQuoteGenerator">
        <h1>Random Quote Generator</h1>

        {/* Display loading, error, or the quote */}
        {error && <p>{error}</p>}
        {successMessage && <p>{successMessage}</p>}

        {/* Display Loading, Error, or the Quote */}
        {loading ? (
          <div className="loadindimg">
            <LoadingIcon />
          </div>
        ) : (
          <>
            <div ref={quoteRef} className="quote-container" style={{ backgroundColor: bgColor, transition: "background-color 1s ease", margin: "20px", borderRadius: "20px" }}>
              <p className="qouteText">"{quote}"</p>
              <p className="qouteAuthor">- {author}</p>
            </div>
            <div className="sharebtn">
              <button className="button" onClick={fetchRandomQuotes}>Get New Quote</button>
              <button onClick={shareQuoteAsImage} className="button sharebtn">Download Quote as Image</button>
            </div>
          </>
        )}

        {/* Button to toggle Add Quote form */}
        <button className="button addQuote" onClick={() => setAddQuote(!addQuote)}>
          {addQuote ? "Cancel" : "Add Quote"}
        </button>

        {/* Conditionally Render the Add Quote form */}
        {addQuote && (
          <div className="inputNewQuote">
            <h2 className="h2Text">Add New Quote</h2>
            <form onSubmit={addNewQuotes}>
              <textarea
                placeholder="Enter the quote"
                value={newQuote}
                onChange={(e) => setNewQuote(e.target.value)}
                className="inputQuoteText textarea"
                required
              />
              <br />
              <input
                type="text"
                placeholder="Author"
                value={newAuthor}
                onChange={(e) => setNewAuthor(e.target.value)}
                className="inputQuoteText"
                required
              />
              <br />
              <button className="button submit" type="submit">
                Submit
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default RandomQuoteGenerator;