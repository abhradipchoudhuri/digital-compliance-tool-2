# Create a proper App.jsx with Tailwind classes
echo 'import React from "react";

function App() {
  return (
    <div className="min-h-screen bg-bf-blue text-bf-gold p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">
          Digital Compliance Tool
        </h1>
        <p className="text-lg mb-6">
          A modern Electron desktop application for generating compliant legal copy.
        </p>
        <div className="bg-white text-bf-blue p-4 rounded-lg">
          <p>Application is running successfully!</p>
        </div>
      </div>
    </div>
  );
}

export default App;' > src/renderer/App.jsx