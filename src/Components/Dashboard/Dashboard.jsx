import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Card,
  CardBody,
  Typography,
  Input,
  IconButton,
} from "@material-tailwind/react";
import {
  PlusIcon,
  TrashIcon,
  ChevronRightIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { Question } from "../../utils/Controllers/Question";
import { Alert } from "../../utils/Alert";
import Loading from "../UI/Loadings/Loading";

// import { Question } from "@/api/Question"; // если используете axios-сервис

// ===== UUID v4 =====
function uuidv4() {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const buf = new Uint8Array(16);
    crypto.getRandomValues(buf);
    buf[6] = (buf[6] & 0x0f) | 0x40;
    buf[8] = (buf[8] & 0x3f) | 0x80;
    const hx = (n) => n.toString(16).padStart(2, "0");
    const b = Array.from(buf, hx).join("");
    return `${b.slice(0, 8)}-${b.slice(8, 12)}-${b.slice(12, 16)}-${b.slice(16, 20)}-${b.slice(20)}`;
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ===== utils: clamp, parse/format location/width =====
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const MIN_W = 300;
const MAX_W = 1000;
const WORLD_W = 20000;
const WORLD_H = 20000;

const Q_WIDTH_DEFAULT = 320;
const A_WIDTH_DEFAULT = 300;
const GAP_Q_TO_A = 30;
const GAP_A_TO_Q = 30;
const V_GAP = 120;
const ROOT_START_X = 100;
const ROOT_START_Y = 80;
const ROOT_BLOCK_EXTRA_GAP = 80;

const parseLocation = (s, fallback = { x: 0, y: 0 }) => {
  if (typeof s !== "string") return fallback;
  // ожидаем "x=14, y=20"
  const m = s.match(/x\s*=\s*(-?\d+)\s*,\s*y\s*=\s*(-?\d+)/i);
  if (!m) return fallback;
  return { x: Number(m[1]), y: Number(m[2]) };
};
const formatLocation = ({ x, y }) => `x=${Math.round(x)}, y=${Math.round(y)}`;

const parseWidth = (s, fallback) => {
  if (typeof s === "number") return clamp(s, MIN_W, MAX_W);
  if (typeof s !== "string") return fallback;
  const m = s.match(/(-?\d+)\s*px/i);
  if (!m) return fallback;
  return clamp(Number(m[1]), MIN_W, MAX_W);
};
const formatWidth = (w) => `${Math.round(clamp(w ?? MIN_W, MIN_W, MAX_W))}px`;

const Dashboard = () => {
  const [postLoading, setPostLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  // ===== граф =====
  const [questions, setQuestions] = useState([
    {
      id: uuidv4(),
      text: "Начальный вопрос",
      position: { x: 400, y: 100 },
      width: Q_WIDTH_DEFAULT,
      answers: [],
    },
  ]);
  const [answers, setAnswers] = useState([]);
  const [collapsed, setCollapsed] = useState({}); // { [answerId]: true }

  // ===== зум/пан =====
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // ===== drag/resize =====
  const dragRef = useRef({
    type: null, // 'drag-q' | 'drag-a' | 'resize-q' | 'resize-a'
    id: null,
    startX: 0,
    startY: 0,
    startPos: null,
    startW: 0,
  });

  // ===== CRUD локально =====
  const addRootQuestion = () => {
    const q = {
      id: uuidv4(),
      text: "Новый вопрос",
      answers: [],
      position: { x: Math.random() * 500 + 100, y: Math.random() * 300 + 100 },
      width: Q_WIDTH_DEFAULT,
    };
    setQuestions((p) => [...p, q]);
  };

  const addAnswer = (questionId) => {
    const q = questions.find((q) => q.id === questionId);
    const qAnswers = answers.filter((a) => a.questionId === questionId);
    const newAnswer = {
      id: uuidv4(),
      text: "Новый ответ",
      questionId,
      position: {
        x: q.position.x + (q.width ?? Q_WIDTH_DEFAULT) + GAP_Q_TO_A,
        y: q.position.y + qAnswers.length * V_GAP,
      },
      width: A_WIDTH_DEFAULT,
      nextQuestionId: null,
    };
    setAnswers((p) => [...p, newAnswer]);
    setQuestions((p) =>
      p.map((qq) =>
        qq.id === questionId
          ? { ...qq, answers: [...(qq.answers || []), newAnswer.id] }
          : qq
      )
    );
  };

  const addChildQuestion = (answerId) => {
    const a = answers.find((x) => x.id === answerId);
    const newQ = {
      id: uuidv4(),
      text: "Новый вопрос",
      answers: [],
      position: {
        x: a.position.x + (a.width ?? A_WIDTH_DEFAULT) + GAP_A_TO_Q,
        y: a.position.y,
      },
      width: Q_WIDTH_DEFAULT,
    };
    setAnswers((p) =>
      p.map((x) => (x.id === answerId ? { ...x, nextQuestionId: newQ.id } : x))
    );
    setQuestions((p) => [...p, newQ]);
  };

  const updateQuestionText = (id, text) =>
    setQuestions((p) => p.map((q) => (q.id === id ? { ...q, text } : q)));
  const updateAnswerText = (id, text) =>
    setAnswers((p) => p.map((a) => (a.id === id ? { ...a, text } : a)));

  const deleteQuestion = (id) => {
    const qAnswers = answers.filter((a) => a.questionId === id);
    qAnswers.forEach((a) => {
      if (a.nextQuestionId) deleteQuestion(a.nextQuestionId);
    });
    setAnswers((p) => p.filter((a) => a.questionId !== id));
    setQuestions((p) => p.filter((q) => q.id !== id));
  };

  const deleteAnswer = (id) => {
    const a = answers.find((x) => x.id === id);
    if (a?.nextQuestionId) deleteQuestion(a.nextQuestionId);
    setQuestions((p) =>
      p.map((q) =>
        (q.answers || []).includes(id)
          ? { ...q, answers: q.answers.filter((x) => x !== id) }
          : q
      )
    );
    setAnswers((p) => p.filter((x) => x.id !== id));
    setCollapsed((p) => {
      const c = { ...p };
      delete c[id];
      return c;
    });
  };

  const toggleCollapse = (answerId) =>
    setCollapsed((p) => ({ ...p, [answerId]: !p[answerId] }));

  // ===== зум/пан =====
  useEffect(() => {
    let zoomTimeout;

    const wheel = (e) => {
      if (e.ctrlKey && containerRef.current?.contains(e.target)) {
        e.preventDefault();
        e.stopPropagation();

        clearTimeout(zoomTimeout);
        zoomTimeout = setTimeout(() => {
          const delta = -e.deltaY * 0.001; // Медленный и плавный
          setZoom((z) => clamp(z + delta, 0.3, 3));
        }, 16);
      }
    };

    document.addEventListener("wheel", wheel, { passive: false });
    return () => {
      document.removeEventListener("wheel", wheel);
      clearTimeout(zoomTimeout);
    };
  }, []);

  const panDown = (e) => {
    if (e.button !== 0 || e.ctrlKey) return;
    if (e.target.dataset?.noPan === "1") return;
    setIsPanning(true);
    setPanStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };
  const panMove = (e) => {
    if (isPanning) setPosition({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
  };
  const panUp = () => setIsPanning(false);

  // ===== drag/resize =====
  const startDrag = (type, id, e) => {
    e.stopPropagation();

    // Определяем в каком массиве искать объект
    let obj;
    if (type === "drag-q" || type === "resize-q") {
      // Для вопросов и ресайза вопросов ищем в questions
      obj = questions.find((q) => q.id === id);
    } else {
      // Для ответов и ресайза ответов ищем в answers
      obj = answers.find((a) => a.id === id);
    }

    // Используем значения по умолчанию, если свойства отсутствуют
    const position = obj.position || { x: 0, y: 0 };
    const width = obj.width || 100;

    dragRef.current = {
      type,
      id,
      startX: e.clientX,
      startY: e.clientY,
      startPos: { ...position },
      startW: width,
      element: obj,
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  const onMove = (e) => {
    const st = dragRef.current;
    if (!st.type) return;
    const dx = (e.clientX - st.startX) / zoom;
    const dy = (e.clientY - st.startY) / zoom;

    if (st.type === "drag-q") {
      setQuestions((p) =>
        p.map((q) =>
          q.id === st.id
            ? { ...q, position: { x: st.startPos.x + dx, y: st.startPos.y + dy } }
            : q
        )
      );
    } else if (st.type === "drag-a") {
      setAnswers((p) =>
        p.map((a) =>
          a.id === st.id
            ? { ...a, position: { x: st.startPos.x + dx, y: st.startPos.y + dy } }
            : a
        )
      );
    } else if (st.type === "resize-q") {
      const w = clamp(st.startW + dx, MIN_W, MAX_W);
      setQuestions((p) => p.map((q) => (q.id === st.id ? { ...q, width: w } : q)));
    } else if (st.type === "resize-a") {
      const w = clamp(st.startW + dx, MIN_W, MAX_W);
      setAnswers((p) => p.map((a) => (a.id === st.id ? { ...a, width: w } : a)));
    }
  };

  const onUp = () => {
    dragRef.current.type = null;
    document.removeEventListener("mousemove", onMove);
    document.removeEventListener("mouseup", onUp);
  };

  // ===== гидрация из backend: учитываем location/width если есть =====
  const hydrateFromBackend = (apiRoots) => {
    const qs = [];
    const as = [];

    const placeQuestion = (qNode, fallbackX, fallbackY) => {
      const qid = qNode.id || uuidv4();

      // позиция и ширина из бэка (если заданы)
      const qPos = qNode.location
        ? parseLocation(qNode.location, { x: fallbackX, y: fallbackY })
        : { x: fallbackX, y: fallbackY };
      const qWidth = qNode.width
        ? parseWidth(qNode.width, Q_WIDTH_DEFAULT)
        : Q_WIDTH_DEFAULT;

      qs.push({
        id: qid,
        text: qNode.text ?? "",
        position: qPos,
        width: qWidth,
        answers: [],
      });

      const thisQAnswers = qNode.answers || [];
      thisQAnswers.forEach((aNode, idx) => {
        const aid = aNode.id || uuidv4();

        // позиция/ширина ответа: приоритет backend location/width, иначе рассчитываем
        const fallbackAX = qPos.x + qWidth + GAP_Q_TO_A;
        const fallbackAY = qPos.y + idx * V_GAP;
        const aPos = aNode.location
          ? parseLocation(aNode.location, { x: fallbackAX, y: fallbackAY })
          : { x: fallbackAX, y: fallbackAY };
        const aWidth = aNode.width
          ? parseWidth(aNode.width, A_WIDTH_DEFAULT)
          : A_WIDTH_DEFAULT;

        as.push({
          id: aid,
          text: aNode.text ?? "",
          questionId: qid,
          position: aPos,
          width: aWidth,
          nextQuestionId: aNode.next_question_id || (aNode.next_question?.id ?? null),
        });

        // привяжем ответ к вопросу (для удобства)
        const qi = qs.findIndex((qq) => qq.id === qid);
        if (qi >= 0) {
          qs[qi] = { ...qs[qi], answers: [...(qs[qi].answers || []), aid] };
        }

        // дочерний вопрос: используем его собственные location/width если есть,
        // иначе ставим справа от ответа на той же высоте
        if (aNode.next_question) {
          const nQ = aNode.next_question;
          const childFallbackX = aPos.x + aWidth + GAP_A_TO_Q;
          const childFallbackY = aPos.y;
          placeQuestion(nQ, childFallbackX, childFallbackY);
        }
      });

      const usedRows = Math.max(1, thisQAnswers.length);
      return { bottomY: qPos.y + usedRows * V_GAP };
    };

    // разложим корни вертикальными блоками; если у корня есть location — используем его Y и X
    let cursorY = ROOT_START_Y;
    apiRoots.forEach((root) => {
      const rootPos = root.location ? parseLocation(root.location, { x: ROOT_START_X, y: cursorY }) : { x: ROOT_START_X, y: cursorY };
      const { bottomY } = placeQuestion(root, rootPos.x, rootPos.y);
      cursorY = Math.max(cursorY, bottomY + ROOT_BLOCK_EXTRA_GAP);
    });

    setQuestions(qs);
    setAnswers(as);
    setCollapsed({});
  };

  // ===== GET =====
  const getQuestion = async () => {
    setLoading(true)
    try {
      const response = await Question?.GetQuestion();
      const roots = Array.isArray(response?.data?.data) ? response.data.data : [];
      hydrateFromBackend(roots);
    } catch (error) {
      console.error("getQuestion error:", error);
    } finally {
      setLoading(false)
    }
  };

  useEffect(() => {
    getQuestion();
  }, []);

  // ===== индексы для сериализации =====
  const buildIndexes = (questions, answers) => {
    const qById = new Map(questions.map((q) => [q.id, q]));
    const answersByQuestion = new Map();
    for (const a of answers) {
      if (!answersByQuestion.has(a.questionId)) answersByQuestion.set(a.questionId, []);
      answersByQuestion.get(a.questionId).push(a);
    }
    const childQIds = new Set();
    for (const a of answers) if (a.nextQuestionId) childQIds.add(a.nextQuestionId);
    const rootQuestions = questions.filter((q) => !childQIds.has(q.id));
    return { qById, answersByQuestion, rootQuestions };
  };

  // ===== условная сериализация с location/width как строки =====
  const serializeAnswer = (a, indexes, seen) => {
    const obj = {
      id: a.id,
      question_id: a.questionId,
      text: a.text,
      location: formatLocation(a.position), // ← строка "x=.., y=.."
      width: formatWidth(a.width),          // ← строка "Npx"
    };
    if (a.nextQuestionId) {
      obj.next_question_id = a.nextQuestionId;
      const nextQ = indexes.qById.get(a.nextQuestionId);
      const child = serializeQuestion(nextQ, indexes, new Set(seen));
      if (child) obj.next_question = child;
    }
    return obj;
  };

  const serializeQuestion = (q, indexes, seen = new Set()) => {
    if (!q || seen.has(q.id)) return null;
    seen.add(q.id);
    const out = {
      id: q.id,
      text: q.text,
      location: formatLocation(q.position), // ← строка
      width: formatWidth(q.width),          // ← строка
    };
    const list = indexes.answersByQuestion.get(q.id) || [];
    if (list.length > 0) out.answers = list.map((a) => serializeAnswer(a, indexes, seen));
    return out;
  };

  const buildPayload = () => {
    const indexes = buildIndexes(questions, answers);
    const { rootQuestions } = indexes;
    const payloadQuestions = rootQuestions
      .map((rootQ) => serializeQuestion(rootQ, indexes))
      .filter(Boolean);
    return { questions: payloadQuestions };
  };

  // ===== POST =====
  const Post = async () => {
    setPostLoading(true)
    try {
      const payload = buildPayload();

      // Axios-сервис:
      const res = await Question?.CreatePost(payload);
      Alert("Muvaffaqiyatli", "success");

      console.log("Posted OK:", res);
    } catch (err) {
      console.error("Post error:", err);
      Alert("Xatolik yuz berdi", "error");
    } finally {
      setPostLoading(false)
    }
  };

  // ===== скрытые из-за collapse =====
  const hiddenQuestionIds = useMemo(() => {
    const hidden = new Set();
    const nextByAnswer = new Map(answers.map((a) => [a.id, a.nextQuestionId]));
    const answersByQuestion = new Map();
    answers.forEach((a) => {
      const arr = answersByQuestion.get(a.questionId) || [];
      arr.push(a);
      answersByQuestion.set(a.questionId, arr);
    });
    const hideSubtreeFromQuestion = (qId) => {
      if (!qId || hidden.has(qId)) return;
      hidden.add(qId);
      const ans = answersByQuestion.get(qId) || [];
      ans.forEach((a) => {
        const childQ = nextByAnswer.get(a.id);
        if (childQ) hideSubtreeFromQuestion(childQ);
      });
    };
    Object.entries(collapsed).forEach(([answerId, isCollapsed]) => {
      if (isCollapsed) {
        const childQ = nextByAnswer.get(answerId);
        if (childQ) hideSubtreeFromQuestion(childQ);
      }
    });
    return hidden;
  }, [answers, collapsed]);

  const hiddenAnswerIds = useMemo(() => {
    const s = new Set();
    answers.forEach((a) => {
      if (hiddenQuestionIds.has(a.questionId)) s.add(a.id);
    });
    return s;
  }, [answers, hiddenQuestionIds]);

  // ===== линии =====
  const linkQtoA = (q, a) => ({
    startX: q.position.x + (q.width ?? Q_WIDTH_DEFAULT),
    startY: q.position.y + 60,
    endX: a.position.x,
    endY: a.position.y + 40,
  });
  const linkAtoQ = (a, q) => ({
    startX: a.position.x + (a.width ?? A_WIDTH_DEFAULT),
    startY: a.position.y + 40,
    endX: q.position.x,
    endY: q.position.y + 60,
  });

  if (loading) {
    return (
      <Loading />
    )
  }

  return (
    <div className="w-full h-screen bg-gray-100 overflow-hidden">
      {/* GET/POST */}
      <div className="absolute top-4 right-4 z-50 flex gap-2">
        <button
          disabled={postLoading}
          onClick={Post}
          className="px-3 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-500"
        >
          {postLoading ? "Saqlanmoqda..." : "Saqlash"}
        </button>
      </div>

      <div
        ref={containerRef}
        className="w-full h-full relative bg-gray-100"
        onMouseDown={panDown}
        onMouseMove={panMove}
        onMouseUp={panUp}
        onMouseLeave={panUp}
        style={{
          cursor: isPanning ? "grabbing" : "grab",
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)
          `,
          backgroundSize: `${40 * zoom}px ${40 * zoom}px`,
        }}
      >
        <div
          className="absolute top-0 left-0"
          style={{
            width: WORLD_W,
            height: WORLD_H,
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
            transformOrigin: "0 0",
          }}
        >
          {/* + корневой вопрос (локально) */}
          <Card
            className="w-12 h-12 flex items-center justify-center border-2 border-dashed border-gray-400 bg-white hover:bg-gray-50 cursor-pointer"
            onClick={addRootQuestion}
            data-no-pan="1"
            style={{ position: "absolute", left: 40, top: 40 }}
          >
            <PlusIcon className="h-6 w-6 text-gray-600" />
          </Card>

          {/* SVG линии */}
          <svg
            width={WORLD_W}
            height={WORLD_H}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              overflow: "visible",
              pointerEvents: "none",
              zIndex: 0,
            }}
          >
            {questions.map((q) =>
              hiddenQuestionIds.has(q.id)
                ? null
                : answers
                  .filter((a) => a.questionId === q.id && !hiddenAnswerIds.has(a.id))
                  .map((a) => {
                    const { startX, startY, endX, endY } = linkQtoA(q, a);
                    const mid = (startX + endX) / 2;
                    return (
                      <path
                        key={`qa-${q.id}-${a.id}`}
                        d={`M ${startX} ${startY} C ${mid} ${startY} ${mid} ${endY} ${endX} ${endY}`}
                        stroke="#3b82f6"
                        strokeWidth="2"
                        fill="none"
                        strokeDasharray="6,6"
                      />
                    );
                  })
            )}
            {answers
              .filter(
                (a) =>
                  a.nextQuestionId &&
                  !collapsed[a.id] &&
                  !hiddenAnswerIds.has(a.id) &&
                  !hiddenQuestionIds.has(a.nextQuestionId)
              )
              .map((a) => {
                const q2 = questions.find((q) => q.id === a.nextQuestionId);
                if (!q2) return null;
                const { startX, startY, endX, endY } = linkAtoQ(a, q2);
                const mid = (startX + endX) / 2;
                return (
                  <path
                    key={`aq-${a.id}-${q2.id}`}
                    d={`M ${startX} ${startY} C ${mid} ${startY} ${mid} ${endY} ${endX} ${endY}`}
                    stroke="#10b981"
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray="6,6"
                  />
                );
              })}
          </svg>

          {/* ВОПРОСЫ */}
          {questions.map((q) =>
            hiddenQuestionIds.has(q.id) ? null : (
              <div
                key={q.id}
                className="absolute"
                style={{
                  left: q.position.x,
                  top: q.position.y,
                  width: q.width,
                  zIndex: 1,
                }}
              >
                <Card
                  className="shadow-lg border-2 border-blue-500 bg-white relative"
                  data-no-pan="1"
                  onMouseDown={(e) => startDrag("drag-q", q.id, e)}
                >
                  <CardBody className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <Input
                        value={q.text}
                        onChange={(e) => updateQuestionText(q.id, e.target.value)}
                        className="!border-0 !bg-transparent text-lg font-semibold"
                        labelProps={{ className: "hidden" }}
                        containerProps={{ className: "min-w-0 flex-1" }}
                      />
                      <div className="flex gap-1 ml-2">
                        <IconButton
                          variant="text"
                          size="sm"
                          onClick={() => addAnswer(q.id)}
                          className="hover:bg-blue-50"
                          data-no-pan="1"
                          title="Добавить ответ"
                        >
                          <PlusIcon className="h-5 w-5 text-blue-600" />
                        </IconButton>
                        {questions.length > 1 && (
                          <IconButton
                            variant="text"
                            size="sm"
                            color="red"
                            onClick={() => deleteQuestion(q.id)}
                            className="hover:bg-red-50"
                            data-no-pan="1"
                            title="Удалить вопрос"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </IconButton>
                        )}
                      </div>
                    </div>
                  </CardBody>
                  {/* ручка ресайза справа */}
                  <div
                    onMouseDown={(e) => startDrag("resize-q", q.id, e)}
                    className="absolute top-0 right-0 h-full w-2 cursor-ew-resize"
                    data-no-pan="1"
                    title="Потяните, чтобы изменить ширину"
                  />
                </Card>
              </div>
            )
          )}

          {/* ОТВЕТЫ */}
          {answers.map((a) =>
            hiddenAnswerIds.has(a.id) ? null : (
              <div
                key={a.id}
                className="absolute"
                style={{
                  left: a.position.x,
                  top: a.position.y,
                  width: a.width,
                  zIndex: 1,
                }}
              >
                <Card
                  className="shadow-lg border-2 border-green-500 bg-white relative"
                  data-no-pan="1"
                  onMouseDown={(e) => startDrag("drag-a", a.id, e)}
                >
                  <CardBody className="p-3">
                    <div className="flex justify-between items-center">
                      <Input
                        value={a.text}
                        onChange={(e) => updateAnswerText(a.id, e.target.value)}
                        className="!border-0 !bg-transparent flex-1"
                        labelProps={{ className: "hidden" }}
                        containerProps={{ className: "min-w-0" }}
                      />
                      <div className="flex gap-1 ml-2">
                        {a.nextQuestionId && (
                          <IconButton
                            variant="text"
                            size="sm"
                            onClick={() => toggleCollapse(a.id)}
                            className="hover:bg-yellow-50"
                            data-no-pan="1"
                            title={collapsed[a.id] ? "Развернуть ветку" : "Свернуть ветку"}
                          >
                            {collapsed[a.id] ? (
                              <ChevronRightIcon className="h-4 w-4 text-yellow-600" />
                            ) : (
                              <ChevronDownIcon className="h-4 w-4 text-yellow-600" />
                            )}
                          </IconButton>
                        )}
                        {!a.nextQuestionId && (
                          <IconButton
                            variant="text"
                            size="sm"
                            onClick={() => addChildQuestion(a.id)}
                            className="hover:bg-green-50"
                            data-no-pan="1"
                            title="Добавить дочерний вопрос"
                          >
                            <PlusIcon className="h-4 w-4 text-green-600" />
                          </IconButton>
                        )}
                        <IconButton
                          variant="text"
                          size="sm"
                          color="red"
                          onClick={() => deleteAnswer(a.id)}
                          className="hover:bg-red-50"
                          data-no-pan="1"
                          title="Удалить ответ"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </IconButton>
                      </div>
                    </div>
                  </CardBody>
                  {/* ручка ресайза справа */}
                  <div
                    onMouseDown={(e) => startDrag("resize-a", a.id, e)}
                    className="absolute top-0 right-0 h-full w-2 cursor-ew-resize"
                    data-no-pan="1"
                    title="Потяните, чтобы изменить ширину"
                  />
                </Card>
              </div>
            )
          )}
        </div>

        {/* индикатор масштаба */}
        <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg px-3 py-2 border">
          <Typography variant="small" className="font-mono text-gray-700">
            {Math.round(zoom * 100)}%
          </Typography>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
