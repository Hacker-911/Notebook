const express = require("express");
const Router = express.Router();
const fetchUser = require("../middleware/fetchUser");
const Note = require("../models/Note");
const { body, validationResult } = require("express-validator");

//Route 1: Get All the notes using GET "/api/notes/fetchallnotes".Login Required
Router.get("/fetchallnotes", fetchUser, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id });
    res.json(notes);
  } catch (error) {
    //Ideally send error to Logger or SQS but for now just log it
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

//Route 2: Add a new Note using POST "/api/notes/addnote".Log in Required
Router.post("/addnote", fetchUser, [body("title", "Enter a valid title").isLength({ min: 3 }), body("description", "Description must be atleast 5 characters").isLength({ min: 5 })], async (req, res) => {
  try {
    const { title, description, tag } = req.body;
    //If there are errors, return Bad Request.
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const note = new Note({
      title,
      description,
      tag,
      user: req.user.id,
    });

    const savedNote = await note.save();

    res.json(savedNote);
  } catch (error) {
    //Ideally send error to Logger or SQS but for now just log it
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

//Route 3: Update an Existing Note using PUT "/api/notes/updatenote". Log in Required
Router.put("/updatenote/:id", fetchUser, async (req, res) => {
  const { title, description, tag } = req.body;

  try {
    //Create a new Note object
    const newNote = {};
    if (title) {
      newNote.title = title;
    }
    if (description) {
      newNote.description = description;
    }
    if (tag) {
      newNote.tag = tag;
    }

    let note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).send("Not Found");
    }

    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed");
    }

    note = await Note.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true });
    res.json({ note });
  } catch (error) {
    //Ideally send error to Logger or SQS but for now just log it
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

//Route 4: Delete a Note using DELETE "/api/notes/deletenote". Log in Required
Router.delete("/deletenote/:id", fetchUser, async (req, res) => {
  try {
    //Find the note that needs to be deleted
    let note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).send("Not Found");
    }

    //Allow deletion only if user owns the note
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed");
    }

    //Delete the note
    note = await Note.findByIdAndDelete(req.params.id);
    res.json({ Success: "Note has been Deleted", note });
  } catch (error) {
    //Ideally send error to Logger or SQS but for now just log it
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = Router;
