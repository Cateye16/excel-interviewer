import React, { useState, useEffect, useRef } from "react";
import "./App.css";

// 10-question bank
const originalQuestions = [
  "What is VLOOKUP in Excel?",
  "Explain what a PivotTable does.",
  "What is the difference between relative and absolute cell references?",
  "How do you apply conditional formatting?",
  "What are Excel macros used for?",
  "How do you use IF statements in Excel?",
  "What is the difference between COUNT, COUNTA, and COUNTIF?",
  "Explain CONCATENATE vs TEXTJOIN in Excel.",
  "What is Data Validation used for?",
  "How do you protect a worksheet or workbook in Excel?"
];

// Key points for scoring
const expectedKeypoints = {
  0: ["lookup_value", "table_array", "col_index_num", "leftmost column", "range_lookup"],
  1: ["grouping", "rows/columns/values/filters", "aggregation", "drag fields"],
  2: ["relative references", "absolute references", "mixed references"],
  3: ["select range", "Conditional Formatting", "rule", "formula"],
  4: ["record macro", "VBA", "automation", "security"],
  5: ["IF statement", "logical test", "value if true", "value if false"],
  6: ["COUNT", "COUNTA", "COUNTIF", "differences"],
  7: ["CONCATENATE", "TEXTJOIN", "differences"],
  8: ["data validation", "restrict input", "dropdowns"],
  9: ["protect worksheet", "protect workbook", "password"]
};

// shuffle function
const shuffleArray = (arr) => [...arr].sort(() => Math.random() - 0.5);

function App() {
  const [msg, setMsg] = useState("");
  const [logs, setLogs] = useState([
    {
      from: "AGENT",
      text:
        "👋 Hi, I’m your Excel Mock Interviewer! Type 'ready' when you want to start the interview. After answering all questions, you will receive a feedback report summarizing your performance. Good luck! 🍀"
    }
  ]);

  const [sessionState, setSessionState] = useState("waiting"); // waiting, in_progress, finished
  const [questions, setQuestions] = useState(shuffleArray(originalQuestions));
  const [currentQ, setCurrentQ] = useState(-1);
  const [answers, setAnswers] = useState([]);

  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const appendLog = (entry) => setLogs((prev) => [...prev, entry]);

  const sendAnswer = () => {
    const userMessage = msg.trim();
    if (!userMessage) return;

    appendLog({ from: "YOU", text: userMessage });

    // WAITING: before starting
    if (sessionState === "waiting") {
      if (userMessage.toLowerCase() === "ready") {
        setSessionState("in_progress");
        setQuestions(shuffleArray(originalQuestions));
        setCurrentQ(0);
        setAnswers([]);
        appendLog({
          from: "AGENT",
          text: `✅ Great! Let's start. Question 1: ${questions[0]}`
        });
      } else {
        appendLog({ from: "AGENT", text: "⚠️ Please type 'ready' to start the interview." });
      }
      setMsg("");
      return;
    }

    // IN_PROGRESS: record answer and move forward
    if (sessionState === "in_progress") {
      const updatedAnswers = [...answers, userMessage];
      setAnswers(updatedAnswers);

      const nextIndex = currentQ + 1;
      if (nextIndex < questions.length) {
        setCurrentQ(nextIndex);
        appendLog({
          from: "AGENT",
          text: `✅ Got it! Next question:\nQuestion ${nextIndex + 1}: ${questions[nextIndex]}`
        });
      } else {
        // finished
        const summaryText = updatedAnswers
          .map((answer, i) => {
            const keyPoints = expectedKeypoints[i] || [];
            const covered = keyPoints.filter((kp) => answer.toLowerCase().includes(kp.toLowerCase()));
            const missed = keyPoints.filter((kp) => !covered.includes(kp));
            return `Q${i + 1}: ${questions[i]}\nYour Answer: ${answer}\nKey Points Covered: ${
              covered.length ? covered.join(", ") : "None"
            }\nKey Points Missed: ${missed.length ? missed.join(", ") : "None"}\nFeedback: ${
              covered.length ? "Good! You covered key points." : "This answer did not cover the required points."
            }`;
          })
          .join("\n\n");

        const score = updatedAnswers.reduce((acc, ans, idx) => {
          const keyPoints = expectedKeypoints[idx] || [];
          const covered = keyPoints.filter((kp) => ans.toLowerCase().includes(kp.toLowerCase()));
          return acc + (covered.length ? 1 : 0);
        }, 0);

        appendLog({
          from: "AGENT",
          text:
            "✅ All questions answered! Here’s your performance summary:\n\n" +
            summaryText +
            `\n\n📊 Overall Score: ${score} / ${questions.length}\n\nType 'ready' to start a new session.`
        });

        setSessionState("finished");
      }
      setMsg("");
      return;
    }

    // FINISHED: start new session only when typing "ready"
    if (sessionState === "finished") {
      if (userMessage.toLowerCase() === "ready") {
        setSessionState("in_progress");
        setQuestions(shuffleArray(originalQuestions));
        setCurrentQ(0);
        setAnswers([]);
        appendLog({
          from: "AGENT",
          text: `✅ Starting a new session. Question 1: ${questions[0]}`
        });
      } else {
        appendLog({ from: "AGENT", text: "🎯 Interview finished. Type 'ready' to start a new session." });
      }
      setMsg("");
      return;
    }
  };

  return (
    <div className="chat-container">
      <h2 className="chat-heading">Excel Interview Chat</h2>
      <div className="chat-window">
        {logs.map((l, i) => (
          <div key={i} className={`chat-bubble ${l.from === "YOU" ? "user" : "agent"}`}>
            <b>{l.from}:</b> {l.text}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div className="input-container">
        <textarea
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          rows={2}
          className="chat-input"
          placeholder={
            sessionState === "waiting"
              ? "Type 'ready' to start..."
              : sessionState === "in_progress"
              ? "Type your answer..."
              : "Interview finished — type 'ready' to start again"
          }
          onKeyPress={(e) => e.key === "Enter" && sendAnswer()}
        />
        <button onClick={sendAnswer} className="send-btn">
          Send
        </button>
      </div>
    </div>
  );
}

export default App;
