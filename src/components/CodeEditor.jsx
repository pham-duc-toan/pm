import { useState } from "react";
import "./CodeEditor.css";

const CodeEditor = ({
  language = "javascript",
  initialCode = "",
  testCases = [],
  submitButtonText = "Run Tests",
  onSubmit,
}) => {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState("");
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(language);

  const languages = [
    { id: "javascript", name: "JavaScript", icon: "🟨" },
    { id: "python", name: "Python", icon: "🐍" },
    { id: "java", name: "Java", icon: "☕" },
    { id: "cpp", name: "C++", icon: "⚡" },
    { id: "csharp", name: "C#", icon: "💜" },
  ];

  const languageTemplates = {
    javascript: `// JavaScript
function solution(input) {
  // Viết code của bạn ở đây
  return input;
}

// Test
console.log(solution("Hello"));`,
    python: `# Python
def solution(input):
    # Viết code của bạn ở đây
    return input

# Test
print(solution("Hello"))`,
    java: `// Java
public class Solution {
    public static String solution(String input) {
        // Viết code của bạn ở đây
        return input;
    }
    
    public static void main(String[] args) {
        System.out.println(solution("Hello"));
    }
}`,
    cpp: `// C++
#include <iostream>
#include <string>
using namespace std;

string solution(string input) {
    // Viết code của bạn ở đây
    return input;
}

int main() {
    cout << solution("Hello") << endl;
    return 0;
}`,
    csharp: `// C#
using System;

class Solution {
    static string SolutionMethod(string input) {
        // Viết code của bạn ở đây
        return input;
    }
    
    static void Main() {
        Console.WriteLine(SolutionMethod("Hello"));
    }
}`,
  };

  const handleLanguageChange = (langId) => {
    setSelectedLanguage(langId);
    setCode(languageTemplates[langId]);
    setOutput("");
    setTestResults([]);
  };

  const simulateCodeExecution = (code, language) => {
    // Giả lập thực thi code (trong thực tế sẽ gọi API backend)
    return new Promise((resolve) => {
      setTimeout(() => {
        // Giả lập output
        const outputs = [
          "Hello World",
          "42",
          "[1, 2, 3, 4, 5]",
          "Success!",
          "Kết quả: True",
        ];
        const randomOutput =
          outputs[Math.floor(Math.random() * outputs.length)];
        resolve(randomOutput);
      }, 1500);
    });
  };

  const runCode = async () => {
    setIsRunning(true);
    setOutput("⏳ Đang chạy code...\n");

    try {
      const result = await simulateCodeExecution(code, selectedLanguage);
      setOutput(`✅ Chạy thành công!\n\nOutput:\n${result}`);
    } catch (error) {
      setOutput(`❌ Lỗi:\n${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const runTests = async () => {
    if (testCases.length === 0) {
      setOutput("⚠️ Không có test case nào để chạy!");
      return;
    }

    setIsRunning(true);
    setOutput("⏳ Đang chạy test cases...\n");

    const results = [];

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      try {
        // Giả lập chạy test case
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Random pass/fail để demo (thực tế sẽ so sánh output với expected)
        const passed = Math.random() > 0.3; // 70% pass rate

        results.push({
          index: i + 1,
          input: testCase.input,
          expected: testCase.expected,
          actual: passed ? testCase.expected : "Wrong output",
          passed,
        });
      } catch (error) {
        results.push({
          index: i + 1,
          input: testCase.input,
          expected: testCase.expected,
          actual: error.message,
          passed: false,
        });
      }
    }

    setTestResults(results);

    const passedCount = results.filter((r) => r.passed).length;
    const totalCount = results.length;

    setOutput(`
📊 Kết quả Test Cases: ${passedCount}/${totalCount} passed

${results
  .map(
    (r) => `
Test ${r.index}: ${r.passed ? "✅ PASS" : "❌ FAIL"}
Input: ${r.input}
Expected: ${r.expected}
${r.passed ? "" : `Actual: ${r.actual}`}
`
  )
  .join("\n")}
    `);

    setIsRunning(false);

    // Callback khi submit
    if (onSubmit) {
      onSubmit({
        passed: passedCount === totalCount,
        score: Math.round((passedCount / totalCount) * 100),
      });
    }
  };

  const resetCode = () => {
    setCode(languageTemplates[selectedLanguage]);
    setOutput("");
    setTestResults([]);
  };

  return (
    <div className="code-editor-container">
      <div className="editor-header">
        <div className="language-selector">
          {languages.map((lang) => (
            <button
              key={lang.id}
              className={`lang-btn ${
                selectedLanguage === lang.id ? "active" : ""
              }`}
              onClick={() => handleLanguageChange(lang.id)}
            >
              <span className="lang-icon">{lang.icon}</span>
              <span className="lang-name">{lang.name}</span>
            </button>
          ))}
        </div>
        <div className="editor-actions">
          <button
            className="btn-reset"
            onClick={resetCode}
            disabled={isRunning}
          >
            🔄 Reset
          </button>
          <button className="btn-run" onClick={runCode} disabled={isRunning}>
            ▶️ Run Code
          </button>
          {testCases.length > 0 && (
            <button
              className="btn-test"
              onClick={runTests}
              disabled={isRunning}
            >
              🧪 {submitButtonText}
            </button>
          )}
        </div>
      </div>

      <div className="editor-body">
        <div className="code-panel">
          <div className="panel-header">
            <span>💻 Code Editor</span>
            <span className="code-length">{code.length} chars</span>
          </div>
          <textarea
            className="code-textarea"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Nhập code của bạn ở đây..."
            spellCheck={false}
            disabled={isRunning}
          />
        </div>

        <div className="output-panel">
          <div className="panel-header">
            <span>📤 Output</span>
            {testResults.length > 0 && (
              <span className="test-score">
                {testResults.filter((r) => r.passed).length}/
                {testResults.length} passed
              </span>
            )}
          </div>
          <pre className="output-content">
            {output || "// Output sẽ hiển thị ở đây..."}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
