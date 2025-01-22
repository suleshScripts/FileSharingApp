import os
import uuid
import qrcode
from flask import Flask, render_template, request, url_for, send_from_directory, jsonify
from werkzeug.utils import secure_filename

# Flask app initialization
app = Flask(__name__, template_folder='Templates')

# Configuration
UPLOAD_FOLDER = "static/uploads"
QR_FOLDER = "static/qr"
ALLOWED_EXTENSIONS = set([
    'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'exe', 'mp4', 'zip',
    'tar', 'docx', 'xlsx', 'csv', 'json', 'pptx'
])  # Add any other file types as needed
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["QR_FOLDER"] = QR_FOLDER

# Allow up to 10 GB file size
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024 * 1024  # 10 GB

# Ensure folders exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(QR_FOLDER, exist_ok=True)

# Function to check file extension
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route("/", methods=["GET", "POST", "HEAD"])
def index():
    if request.method == "HEAD":
        # Handle HEAD request for health checks
        return "", 200

    if request.method == "POST":
        # Check if a file is included in the request
        if "file" not in request.files:
            return jsonify({"error": "No file part"}), 400

        file = request.files["file"]
        if file.filename == "":
            return jsonify({"error": "No selected file"}), 400

        # Validate and process the file
        if file and allowed_file(file.filename):
            # Save the file securely
            filename = secure_filename(file.filename)
            unique_filename = f"{uuid.uuid4().hex}_{filename}"
            file_path = os.path.join(app.config["UPLOAD_FOLDER"], unique_filename)
            file.save(file_path)

            # Generate a URL for the uploaded file
            file_url = url_for("download_file", filename=unique_filename, _external=True)

            # Generate a QR code for the file URL
            qr = qrcode.QRCode()
            qr.add_data(file_url)
            qr.make(fit=True)

            # Save the QR code image
            qr_image_path = os.path.join(app.config["QR_FOLDER"], f"{unique_filename}.png")
            qr_img = qr.make_image(fill_color="black", back_color="white")
            qr_img.save(qr_image_path)

            # Return the file URL and QR code image path
            return jsonify({
                "file_url": file_url,
                "qr_image": url_for("static", filename=f"qr/{unique_filename}.png", _external=True)
            })

        return jsonify({"error": "File type not allowed"}), 400

    return render_template("index.html")


@app.route("/uploads/<filename>")
def download_file(filename):
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
