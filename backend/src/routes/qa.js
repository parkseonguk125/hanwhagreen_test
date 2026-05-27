import { Router } from "express";
import {
  createQaPost,
  getQaPost,
  getQaPostFull,
  incrementQaHits,
  listQaPosts,
  verifyQaPassword,
} from "../db.js";

const router = Router();

router.get("/", (_req, res) => {
  res.json(listQaPosts());
});

router.get("/:id", (req, res) => {
  const post = getQaPost(req.params.id, { includeContent: true });
  if (!post) {
    res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
    return;
  }
  res.json(post);
});

router.post("/:id/verify", (req, res) => {
  const { password } = req.body || {};
  const id = req.params.id;

  if (!password?.trim()) {
    res.status(400).json({ message: "비밀번호를 입력해 주세요." });
    return;
  }

  const post = getQaPostFull(id);
  if (!post) {
    res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
    return;
  }

  if (!verifyQaPassword(id, password)) {
    res.status(401).json({ message: "비밀번호가 올바르지 않습니다." });
    return;
  }

  incrementQaHits(id);
  res.json(getQaPostFull(id));
});

router.post("/", (req, res) => {
  const { author, password, email, homepage, subject, content, receiveMail } = req.body || {};

  if (!author?.trim() || !password?.trim() || !subject?.trim() || !content?.trim()) {
    res.status(400).json({ message: "필수 항목을 입력해 주세요." });
    return;
  }

  const post = createQaPost({
    author: author.trim(),
    password: password,
    email: (email || "").trim(),
    homepage: (homepage || "").trim(),
    subject: subject.trim(),
    content: content.trim(),
    receiveMail: Boolean(receiveMail),
  });

  res.status(201).json(post);
});

router.post("/:id/hit", (req, res) => {
  const post = getQaPost(req.params.id, { includeContent: true });
  if (!post) {
    res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
    return;
  }

  if (post.isSecret) {
    res.status(403).json({ message: "비밀글은 비밀번호 확인 후 열람할 수 있습니다." });
    return;
  }

  incrementQaHits(req.params.id);
  res.json(getQaPostFull(req.params.id));
});

export default router;
