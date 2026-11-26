import { Router } from "express";
import { authenticated } from "../middlewares/auth";
import * as postController from "./../controllers/post";

export const postRoutes = Router();

postRoutes.get("/", postController.getAll);
postRoutes.get("/:id", postController.getOne);

postRoutes.use(authenticated);

postRoutes.post("/", postController.create);
postRoutes.patch("/:id/archive", postController.archive);
postRoutes.patch("/:id/visibility", postController.changeVisibilityCommentPolicy)
postRoutes.delete("/:id", postController.deleteOne);
