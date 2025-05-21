import "./style.css";
import { AsciiVideo } from "./ascii/AsciiVideo";

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    new AsciiVideo();
  });
} else {
  new AsciiVideo();
}
