import { extractChannels } from "../utility.mjs";
import { ctx as ectx, props } from "../state/editor.mjs";

export default class Thumbnail {
  constructor(height, onImageChange) {
    this.type = "thumbnail";
    this.height = height;
    this.image = document.createElement("img");
    this.imageData = null;
    this.image.crossOrigin = "Anonymous";
    this.image.src = "/assets/icons/image.png";
    this.onImageChange = onImageChange;

    this.setup();
  }

  setup() {
    this.image.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.setAttribute("width", this.image.width);
      canvas.setAttribute("height", this.image.height);
      ctx.drawImage(this.image, 0, 0);
      this.imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      this.onImageChange(this.imageData, extractChannels(this.imageData));
      this.draw(ectx);
    };

    this.htmlInput = document.createElement("input");
    this.htmlInput.type = "file";
    this.htmlInput.parent = this;
    this.imageFileName = null;
    this.htmlInput.accept = "image/*";
    this.htmlInput.onchange = (event) => {
      const fileReader = new FileReader();
      this.imageFileName = event.target.files[0].name.substring(
        0,
        event.target.files[0].name.toString().lastIndexOf(".")
      );
      fileReader.onload = (e) => (this.image.src = e.target.result);
      fileReader.readAsDataURL(event.target.files[0]);
      this.draw(ectx);
    };
  }
  draw(ctx) {
    ctx.beginPath();
    ctx.rect(
      this.parent.x - this.parent.width / 2 + this.x - this.width / 2,
      this.parent.y - this.parent.height / 2 + this.y - this.height / 2,
      this.width,
      this.height
    );
    ctx.fillStyle = "#777777aa";
    ctx.strokeStyle = "#000000aa";
    ctx.fill();
    ctx.stroke();

    let imageWidth, imageHeight;
    if (this.image.width >= this.image.height && this.image.width > this.width) {
      const ratio = this.width / this.image.width;
      imageWidth = this.image.width * ratio;
      imageHeight = this.image.height * ratio;
      if (imageHeight > this.height) {
        const ratio2 = this.height / imageHeight;
        imageWidth *= ratio2;
        imageHeight *= ratio2;
      }
    } else if (this.image.height >= this.image.width && this.image.height > this.height) {
      const ratio = this.height / this.image.height;
      imageHeight = this.image.height * ratio;
      imageWidth = this.image.width * ratio;
      if (imageWidth > this.width) {
        let ratio2 = this.width / imageWidth;
        imageWidth *= ratio2;
        imageHeight *= ratio2;
      }
    } else {
      imageWidth = this.image.width;
      imageHeight = this.image.height;
    }

    imageWidth -= props.unit / 2;
    imageHeight -= props.unit / 2;

    ctx.drawImage(
      this.image,
      this.parent.x - this.parent.width / 2 + this.x - imageWidth / 2,
      this.parent.y - this.parent.height / 2 + this.y - imageHeight / 2,
      imageWidth,
      imageHeight
    );
  }
  scale(factor) {
    this.width *= factor;
    this.height *= factor;
    this.x *= factor;
    this.y *= factor;
  }
  clicked(pos) {
    if (
      pos.x > this.parent.x - this.parent.width / 2 + this.x - this.width / 2 &&
      pos.x < this.parent.x - this.parent.width / 2 + this.x + this.width / 2 &&
      pos.y > this.parent.y - this.parent.height / 2 + this.y - this.height / 2 &&
      pos.y < this.parent.y - this.parent.height / 2 + this.y + this.height / 2
    ) {
      this.htmlInput.click();
    }
  }
}
