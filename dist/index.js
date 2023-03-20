import express from "express";
import fetch from "cross-fetch";
import fileUpload from "express-fileupload";
import dotenv from "dotenv";
import bodyParser from "body-parser";
dotenv.config();
import { ConvertAPI } from "convertapi";
import { ChatGPTAPI } from "chatgpt";
const convertapi = new ConvertAPI(process.env.CONVERT_API_SECRET ? process.env.CONVERT_API_SECRET : "");
const chatGPT = new ChatGPTAPI({
    apiKey: process.env.OPENAI_API_KEY,
});
const app = express();
const port = process.env.PORT;
app.use(fileUpload());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());
app.post("/summary", (req, res) => {
    const data = req.body;
    console.log({ data });
    convertapi
        .convert("txt", { File: req.body.fileUrl }, "pdf")
        .then((result) => {
        const files = result.files;
        fetch(files[0].url).then((textRes) => {
            textRes.text().then((output) => {
                chatGPT
                    .sendMessage(output, {
                    systemMessage: `You are a study ,notes summary tool , you will clean the text because it may contain some unwanted characters ,then you will summarise it in not less than 30 lines `,
                })
                    .then((finalOutput) => {
                    res.json({
                        summary: finalOutput.text,
                    });
                });
            });
        });
    });
});
app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
