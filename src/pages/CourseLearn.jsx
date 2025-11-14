import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import coursesData from "../data/courses.json";
import lessonsData from "../data/lessons.json";
import exercisesData from "../data/exercises.json";
import commentsData from "../data/comments.json";
import CodeEditor from "../components/CodeEditor";
import {
  updateProgress,
  completeLesson,
  updateCourseProgress,
} from "../store/enrollmentSlice";
import "./CourseLearn.css";

const CourseLearn = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { enrolledCourses } = useSelector((state) => state.enrollment);

  // Lấy thông tin course từ JSON mới
  const course = coursesData.courses.find((c) => c.id === parseInt(id));
  const courseInfo = course;
  const courseLessons = lessonsData.lessons.filter(
    (l) => l.courseId === parseInt(id)
  );
  const courseExercises = exercisesData.exercises.filter(
    (e) => e.courseId === parseInt(id)
  );

  // Group lessons theo chapter để tạo curriculum
  const curriculumObj = courseLessons.reduce((acc, lesson) => {
    const chapterKey = `chapter-${lesson.chapterNumber}`;
    if (!acc[chapterKey]) {
      acc[chapterKey] = {
        id: chapterKey,
        title: lesson.chapterTitle,
        lessons: [],
      };
    }
    acc[chapterKey].lessons.push({
      id: lesson.id,
      title: lesson.title,
      type: lesson.type,
      duration: lesson.duration,
      videoUrl: lesson.videoUrl,
      content: lesson.content,
      objectives: lesson.objectives,
      resources: lesson.resources,
      isFree: lesson.isFree,
    });
    return acc;
  }, {});

  const curriculum = Object.values(curriculumObj);

  // Check if user is enrolled
  const enrollment = enrolledCourses.find(
    (e) => e.courseId === parseInt(id) && e.userId === user?.id
  );

  console.log("🔍 CourseLearn Debug:", {
    courseId: id,
    hasUser: !!user,
    hasCourse: !!course,
    courseLessonsCount: courseLessons.length,
    curriculumLength: curriculum.length,
    hasEnrollment: !!enrollment,
    enrollmentId: enrollment?.id,
  });

  const courseDetails = {
    ...courseInfo,
    curriculum: curriculum,
  };

  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [videoProgress, setVideoProgress] = useState(0);
  const [showSidebar, setShowSidebar] = useState(true);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [localComments, setLocalComments] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null);
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionSearch, setMentionSearch] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [reportingItem, setReportingItem] = useState(null); // { type: 'comment' | 'reply', id, commentId? }
  const [reportReason, setReportReason] = useState("");
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!enrollment) {
      alert("Bạn chưa đăng ký khóa học này!");
      navigate(`/course/${id}`);
      return;
    }

    if (!course || curriculum.length === 0) {
      navigate("/");
      return;
    }

    // Load saved progress
    if (
      enrollment.currentModule !== undefined &&
      enrollment.currentLesson !== undefined
    ) {
      setCurrentModuleIndex(enrollment.currentModule);
      setCurrentLessonIndex(enrollment.currentLesson);
    }
  }, [user, enrollment, course, curriculum, id, navigate]);

  useEffect(() => {
    if (currentLesson?.type === "video") {
      // Simulate video duration (random between 5-15 minutes)
      const randomDuration = Math.floor(Math.random() * 600) + 300; // 5-15 minutes in seconds
      setDuration(randomDuration);
      setCurrentTime(0);
      setVideoProgress(0);
      setIsPlaying(false);
    }
  }, [currentModuleIndex, currentLessonIndex]);

  // Auto-play simulation
  useEffect(() => {
    let interval;
    if (isPlaying && currentLesson?.type === "video") {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false);
            handleLessonComplete();
            return duration;
          }
          const newTime = prev + 1;
          setVideoProgress((newTime / duration) * 100);
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  if (!course || curriculum.length === 0 || !enrollment) {
    return null;
  }

  const currentModule = curriculum[currentModuleIndex];
  const currentLesson = currentModule?.lessons[currentLessonIndex];

  // Lấy exercise data nếu lesson type là "exercise"
  const currentExercise =
    currentLesson?.type === "exercise"
      ? courseExercises.find((ex) => ex.lessonId === currentLesson.id)
      : null;

  // Lấy comments cho lesson hiện tại
  const lessonComments = [
    ...commentsData.comments.filter(
      (c) =>
        (c.type === "lesson" && c.targetId === currentLesson?.id) ||
        (c.type === "exercise" &&
          currentExercise &&
          c.targetId === currentExercise.id)
    ),
    ...localComments,
  ];

  const totalLessons = curriculum.reduce(
    (sum, module) => sum + module.lessons.length,
    0
  );
  const completedLessons = enrollment.completedLessons || [];
  const progressPercentage = Math.round(
    (completedLessons.length / totalLessons) * 100
  );

  // Update course progress when completed lessons change
  useEffect(() => {
    if (enrollment && totalLessons > 0) {
      const newProgress = Math.round(
        (completedLessons.length / totalLessons) * 100
      );
      if (enrollment.progress !== newProgress) {
        dispatch(
          updateCourseProgress({
            enrollmentId: enrollment.id,
            progress: newProgress,
          })
        );
      }
    }
  }, [completedLessons.length, totalLessons, enrollment, dispatch]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleLessonComplete = () => {
    const lessonId = currentLesson?.id;

    if (lessonId && !completedLessons.includes(lessonId)) {
      dispatch(
        completeLesson({
          enrollmentId: enrollment.id,
          lessonId,
          moduleIndex: currentModuleIndex,
          lessonIndex: currentLessonIndex,
        })
      );
    }
  };

  const handleNextLesson = () => {
    const currentLessonId = currentLesson?.id;

    // Tự động đánh dấu hoàn thành bài hiện tại khi chuyển sang bài tiếp
    if (currentLessonId && !completedLessons.includes(currentLessonId)) {
      // Nếu là quiz, yêu cầu phải pass mới chuyển được
      if (currentLesson?.type === "quiz" && !showQuizResult?.isPassed) {
        alert("⚠️ Vui lòng hoàn thành bài kiểm tra đạt 100% để tiếp tục!");
        return;
      }

      // Tự động đánh dấu hoàn thành cho các loại khác
      dispatch(
        completeLesson({
          enrollmentId: enrollment.id,
          lessonId: currentLessonId,
        })
      );
    }

    let newModuleIndex = currentModuleIndex;
    let newLessonIndex = currentLessonIndex;

    if (currentLessonIndex < currentModule.lessons.length - 1) {
      newLessonIndex = currentLessonIndex + 1;
      setCurrentLessonIndex(newLessonIndex);
    } else if (currentModuleIndex < curriculum.length - 1) {
      newModuleIndex = currentModuleIndex + 1;
      newLessonIndex = 0;
      setCurrentModuleIndex(newModuleIndex);
      setCurrentLessonIndex(newLessonIndex);
    } else {
      alert("🎉 Chúc mừng! Bạn đã hoàn thành khóa học!");
      return;
    }

    // Lưu vị trí học mới
    dispatch(
      updateProgress({
        enrollmentId: enrollment.id,
        moduleIndex: newModuleIndex,
        lessonIndex: newLessonIndex,
      })
    );

    // Reset video state
    setIsPlaying(false);
    setCurrentTime(0);
    setVideoProgress(0);
    setQuizAnswers({});
    setShowQuizResult(false);
  };

  const handlePreviousLesson = () => {
    let newModuleIndex = currentModuleIndex;
    let newLessonIndex = currentLessonIndex;

    if (currentLessonIndex > 0) {
      newLessonIndex = currentLessonIndex - 1;
      setCurrentLessonIndex(newLessonIndex);
    } else if (currentModuleIndex > 0) {
      const prevModule = curriculum[currentModuleIndex - 1];
      newModuleIndex = currentModuleIndex - 1;
      newLessonIndex = prevModule.lessons.length - 1;
      setCurrentModuleIndex(newModuleIndex);
      setCurrentLessonIndex(newLessonIndex);
    }

    // Lưu vị trí học mới
    dispatch(
      updateProgress({
        enrollmentId: enrollment.id,
        moduleIndex: newModuleIndex,
        lessonIndex: newLessonIndex,
      })
    );

    // Reset video state
    setIsPlaying(false);
    setCurrentTime(0);
    setVideoProgress(0);
    setQuizAnswers({});
    setShowQuizResult(false);
  };

  const goToLesson = (moduleIndex, lessonIndex) => {
    // Kiểm tra xem bài có bị khóa không
    if (isLessonLocked(moduleIndex, lessonIndex)) {
      alert("⚠️ Vui lòng hoàn thành bài trước để mở khóa bài này!");
      return;
    }

    // Đánh dấu bài hiện tại là hoàn thành trước khi chuyển
    const currentLessonId = currentLesson?.id;
    if (
      currentLessonId &&
      !completedLessons.includes(currentLessonId) &&
      currentLesson?.type === "video" &&
      videoProgress >= 90
    ) {
      dispatch(
        completeLesson({
          enrollmentId: enrollment.id,
          lessonId: currentLessonId,
        })
      );
    }

    setCurrentModuleIndex(moduleIndex);
    setCurrentLessonIndex(lessonIndex);

    // Lưu vị trí học mới
    dispatch(
      updateProgress({
        enrollmentId: enrollment.id,
        moduleIndex: moduleIndex,
        lessonIndex: lessonIndex,
      })
    );

    // Reset video state
    setIsPlaying(false);
    setCurrentTime(0);
    setVideoProgress(0);
    setQuizAnswers({});
    setShowQuizResult(false);
  };

  const isLessonCompleted = (lessonId) => {
    return completedLessons.includes(lessonId);
  };

  const isLessonLocked = (moduleIndex, lessonIndex) => {
    // Bài đầu tiên luôn mở khóa
    if (moduleIndex === 0 && lessonIndex === 0) return false;

    const currentLessonObj = curriculum[moduleIndex].lessons[lessonIndex];

    // Nếu là quiz cuối khóa, kiểm tra đã hoàn thành tất cả bài trước chưa
    if (
      currentLessonObj.type === "quiz" &&
      currentLessonObj.title.includes("Kiểm tra cuối khóa")
    ) {
      // Đếm tổng số bài (không tính quiz cuối)
      let totalLessonsBeforeQuiz = 0;
      for (let i = 0; i < curriculum.length; i++) {
        for (let j = 0; j < curriculum[i].lessons.length; j++) {
          if (i === moduleIndex && j === lessonIndex) break;
          totalLessonsBeforeQuiz++;
        }
        if (i === moduleIndex) break;
      }

      // Kiểm tra đã hoàn thành đủ số bài chưa
      return completedLessons.length < totalLessonsBeforeQuiz;
    }

    // Kiểm tra bài trước đó đã hoàn thành chưa
    let prevModuleIndex = moduleIndex;
    let prevLessonIndex = lessonIndex - 1;

    if (prevLessonIndex < 0) {
      // Nếu là bài đầu module, check bài cuối module trước
      if (moduleIndex > 0) {
        prevModuleIndex = moduleIndex - 1;
        prevLessonIndex = curriculum[prevModuleIndex].lessons.length - 1;
      } else {
        return false; // Module đầu tiên
      }
    }

    const prevLesson = curriculum[prevModuleIndex].lessons[prevLessonIndex];
    return !completedLessons.includes(prevLesson.id);
  };

  const canAccessLesson = (moduleIndex, lessonIndex) => {
    return !isLessonLocked(moduleIndex, lessonIndex);
  };

  const handleQuizSubmit = () => {
    const correctAnswers = {
      q1: "b",
      q2: "a",
      q3: "c",
    };

    let score = 0;
    Object.keys(correctAnswers).forEach((key) => {
      if (quizAnswers[key] === correctAnswers[key]) {
        score++;
      }
    });

    const percentage = (score / Object.keys(correctAnswers).length) * 100;
    const totalQuestions = Object.keys(correctAnswers).length;
    const isPassed = percentage === 100; // Phải đúng hết 100%

    setShowQuizResult({
      score,
      totalQuestions,
      percentage,
      isPassed,
    });

    if (isPassed) {
      handleLessonComplete();
    }
  };

  const handleRetryQuiz = () => {
    setQuizAnswers({});
    setShowQuizResult(false);
  };

  const mentionableUsers = [
    { username: "admin", name: "Admin", role: "Quản trị viên" },
    { username: "kiemduyetvien", name: "Kiểm duyệt viên", role: "Moderator" },
    { username: "hotro", name: "Hỗ trợ", role: "Support" },
    { username: "giangvien", name: "Giảng viên", role: "Instructor" },
  ];

  const handleCommentChange = (e) => {
    const value = e.target.value;
    const cursor = e.target.selectionStart;
    setNewComment(value);
    setCursorPosition(cursor);

    // Detect @ mention
    const textBeforeCursor = value.slice(0, cursor);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");

    if (lastAtIndex !== -1) {
      const searchText = textBeforeCursor.slice(lastAtIndex + 1);
      if (searchText.length >= 0 && !searchText.includes(" ")) {
        setMentionSearch(searchText.toLowerCase());
        setShowMentionDropdown(true);
      } else {
        setShowMentionDropdown(false);
      }
    } else {
      setShowMentionDropdown(false);
    }
  };

  const handleSelectMention = (username) => {
    const textBeforeCursor = newComment.slice(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");
    const textBeforeAt = newComment.slice(0, lastAtIndex);
    const textAfterCursor = newComment.slice(cursorPosition);
    const newText = `${textBeforeAt}@${username} ${textAfterCursor}`;

    setNewComment(newText);
    setShowMentionDropdown(false);
    setMentionSearch("");
  };

  const filteredMentions = mentionableUsers.filter(
    (u) =>
      u.username.toLowerCase().includes(mentionSearch) ||
      u.name.toLowerCase().includes(mentionSearch)
  );

  const handleAddComment = () => {
    if (newComment.trim()) {
      if (replyingTo) {
        // Add reply to existing comment
        const reply = {
          id: `reply-${Date.now()}`,
          userId: user?.id,
          userName: user?.fullName || user?.name,
          userAvatar: user?.avatar || "https://i.pravatar.cc/150?img=1",
          content: newComment,
          createdAt: new Date().toISOString(),
          likes: 0,
        };

        setLocalComments(
          localComments.map((comment) => {
            if (comment.id === replyingTo) {
              return {
                ...comment,
                replies: [...(comment.replies || []), reply],
              };
            }
            return comment;
          })
        );

        setReplyingTo(null);
      } else {
        // Add new comment
        const comment = {
          id: `local-${Date.now()}`,
          type: currentLesson?.type === "exercise" ? "exercise" : "lesson",
          targetId: currentLesson?.id,
          userId: user?.id,
          userName: user?.fullName || user?.name,
          userAvatar: user?.avatar || "https://i.pravatar.cc/150?img=1",
          content: newComment,
          rating: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          likes: 0,
          replies: [],
        };
        setLocalComments([...localComments, comment]);
      }

      setNewComment("");
      setShowMentionDropdown(false);
    }
  };

  const handleReply = (commentId) => {
    setReplyingTo(commentId);
    document.querySelector(".add-comment-box textarea")?.focus();
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
    setNewComment("");
  };

  const handleEditComment = (comment) => {
    setEditingComment(comment.id);
    setEditContent(comment.content);
  };

  const handleSaveEdit = (commentId) => {
    if (editContent.trim()) {
      setLocalComments(
        localComments.map((comment) => {
          if (comment.id === commentId) {
            return {
              ...comment,
              content: editContent,
              updatedAt: new Date().toISOString(),
            };
          }
          return comment;
        })
      );
      setEditingComment(null);
      setEditContent("");
    }
  };

  const handleCancelEdit = () => {
    setEditingComment(null);
    setEditContent("");
  };

  const handleDeleteComment = (commentId) => {
    if (window.confirm("Bạn có chắc muốn xóa bình luận này?")) {
      setLocalComments(
        localComments.filter((comment) => comment.id !== commentId)
      );
    }
  };

  const handleDeleteReply = (commentId, replyId) => {
    if (window.confirm("Bạn có chắc muốn xóa phản hồi này?")) {
      setLocalComments(
        localComments.map((comment) => {
          if (comment.id === commentId) {
            return {
              ...comment,
              replies: comment.replies.filter((reply) => reply.id !== replyId),
            };
          }
          return comment;
        })
      );
    }
  };

  const handleReportComment = (commentId) => {
    setReportingItem({ type: "comment", id: commentId });
    setReportReason("");
    setShowReportModal(true);
  };

  const handleReportReply = (commentId, replyId) => {
    setReportingItem({ type: "reply", id: replyId, commentId });
    setReportReason("");
    setShowReportModal(true);
  };

  const handleSubmitReport = () => {
    if (!reportReason) {
      alert("Vui lòng chọn lý do báo cáo!");
      return;
    }

    // Lưu report vào state tạm (trong thực tế sẽ gửi API)
    const reportData = {
      ...reportingItem,
      reason: reportReason,
      reportedBy: user.id,
      reportedAt: new Date().toISOString(),
    };

    console.log("Report submitted:", reportData);
    alert("Đã gửi báo cáo. Cảm ơn bạn đã góp phần giữ cộng đồng trong sạch!");

    // Reset
    setShowReportModal(false);
    setReportingItem(null);
    setReportReason("");
  };

  const handleCancelReport = () => {
    setShowReportModal(false);
    setReportingItem(null);
    setReportReason("");
  };

  return (
    <div className="course-learn-page">
      {/* Header */}
      <div className="learn-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate("/my-courses")}>
            ← Khóa học của tôi
          </button>
          <h2 className="course-title-header">{course.title}</h2>
        </div>
        <div className="header-right">
          <div className="progress-info">
            <span>Tiến độ: {progressPercentage}%</span>
            <div className="progress-bar-small">
              <div
                className="progress-fill-small"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
          <button
            className="toggle-sidebar-btn"
            onClick={() => setShowSidebar(!showSidebar)}
          >
            {showSidebar ? "◀ Ẩn" : "▶ Hiện"}
          </button>
        </div>
      </div>

      <div className="learn-container">
        {/* Main Content */}
        <div className="learn-content">
          <div className="lesson-header">
            <div className="lesson-info">
              <span className="module-name">{currentModule.title}</span>
              <h1 className="lesson-title">
                {currentLesson?.title || "Bài học"}
              </h1>
            </div>
          </div>

          {/* Video Player */}
          {currentLesson?.type === "video" && (
            <div className="video-container">
              <div className="video-player">
                <div className="video-demo">
                  <img
                    src={course.thumbnail}
                    alt={currentLesson.title}
                    className="video-thumbnail-img"
                  />
                  {!isPlaying && videoProgress === 0 && (
                    <div
                      className="play-overlay"
                      onClick={() => setIsPlaying(true)}
                    >
                      <div className="play-button">▶</div>
                    </div>
                  )}
                  {(isPlaying || videoProgress > 0) && (
                    <div className="video-overlay">
                      <div className="video-status">
                        {isPlaying ? "⏸ Đang phát..." : "⏸ Tạm dừng"}
                      </div>
                    </div>
                  )}
                </div>
                <div
                  className={`video-controls ${
                    !isPlaying && videoProgress === 0 ? "hidden" : ""
                  }`}
                >
                  <div
                    className="progress-bar-video"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const clickX = e.clientX - rect.left;
                      const percentage = (clickX / rect.width) * 100;
                      const newTime = (percentage / 100) * duration;
                      setCurrentTime(newTime);
                      setVideoProgress(percentage);
                    }}
                  >
                    <div
                      className="progress-fill-video"
                      style={{ width: `${videoProgress}%` }}
                    ></div>
                  </div>
                  <div className="controls-bottom">
                    <button
                      className="control-btn"
                      onClick={() => setIsPlaying(!isPlaying)}
                    >
                      {isPlaying ? "⏸" : "▶"}
                    </button>
                    <button
                      className="control-btn"
                      onClick={() => {
                        const newTime = Math.max(currentTime - 10, 0);
                        setCurrentTime(newTime);
                        setVideoProgress((newTime / duration) * 100);
                      }}
                    >
                      -10s
                    </button>
                    <button
                      className="control-btn"
                      onClick={() => {
                        const newTime = Math.min(currentTime + 10, duration);
                        setCurrentTime(newTime);
                        setVideoProgress((newTime / duration) * 100);
                      }}
                    >
                      +10s
                    </button>
                    <div className="time-display">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </div>
                  </div>
                </div>
              </div>
              {/* Navigation Buttons */}
              <div className="lesson-navigation">
                <button
                  className="nav-btn prev"
                  onClick={handlePreviousLesson}
                  disabled={
                    currentModuleIndex === 0 && currentLessonIndex === 0
                  }
                >
                  ← Bài trước
                </button>

                <button className="nav-btn next" onClick={handleNextLesson}>
                  Bài tiếp →
                </button>
              </div>

              <div className="video-info">
                <h3>{currentLesson.title}</h3>
                <p>{currentLesson.content}</p>
                {currentLesson.objectives &&
                  currentLesson.objectives.length > 0 && (
                    <div className="lesson-objectives">
                      <h4>🎯 Mục tiêu bài học:</h4>
                      <ul>
                        {currentLesson.objectives.map((obj, idx) => (
                          <li key={idx}>{obj}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                {currentLesson.resources &&
                  currentLesson.resources.length > 0 && (
                    <div className="lesson-resources">
                      <h4>📚 Tài nguyên tham khảo:</h4>
                      <ul>
                        {currentLesson.resources.map((res, idx) => (
                          <li key={idx}>
                            <a
                              href={res.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {res.title}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>
            </div>
          )}

          {/* Quiz Content */}
          {currentLesson?.type === "quiz" && (
            <div className="quiz-container">
              {!showQuizResult ? (
                <>
                  <div className="quiz-header">
                    <div className="quiz-icon">📝</div>
                    <h2>{currentLesson.title}</h2>
                    <p>Hoàn thành bài kiểm tra để tiếp tục</p>
                  </div>

                  <div className="quiz-questions">
                    <div className="question-item">
                      <h3>Câu 1: React là gì?</h3>
                      <label>
                        <input
                          type="radio"
                          name="q1"
                          value="a"
                          onChange={(e) =>
                            setQuizAnswers({
                              ...quizAnswers,
                              q1: e.target.value,
                            })
                          }
                        />
                        A. Một ngôn ngữ lập trình
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="q1"
                          value="b"
                          onChange={(e) =>
                            setQuizAnswers({
                              ...quizAnswers,
                              q1: e.target.value,
                            })
                          }
                        />
                        B. Một thư viện JavaScript
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="q1"
                          value="c"
                          onChange={(e) =>
                            setQuizAnswers({
                              ...quizAnswers,
                              q1: e.target.value,
                            })
                          }
                        />
                        C. Một hệ điều hành
                      </label>
                    </div>

                    <div className="question-item">
                      <h3>Câu 2: JSX là viết tắt của?</h3>
                      <label>
                        <input
                          type="radio"
                          name="q2"
                          value="a"
                          onChange={(e) =>
                            setQuizAnswers({
                              ...quizAnswers,
                              q2: e.target.value,
                            })
                          }
                        />
                        A. JavaScript XML
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="q2"
                          value="b"
                          onChange={(e) =>
                            setQuizAnswers({
                              ...quizAnswers,
                              q2: e.target.value,
                            })
                          }
                        />
                        B. Java Syntax Extension
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="q2"
                          value="c"
                          onChange={(e) =>
                            setQuizAnswers({
                              ...quizAnswers,
                              q2: e.target.value,
                            })
                          }
                        />
                        C. JavaScript Extension
                      </label>
                    </div>

                    <div className="question-item">
                      <h3>Câu 3: Hook nào dùng để quản lý state?</h3>
                      <label>
                        <input
                          type="radio"
                          name="q3"
                          value="a"
                          onChange={(e) =>
                            setQuizAnswers({
                              ...quizAnswers,
                              q3: e.target.value,
                            })
                          }
                        />
                        A. useEffect
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="q3"
                          value="b"
                          onChange={(e) =>
                            setQuizAnswers({
                              ...quizAnswers,
                              q3: e.target.value,
                            })
                          }
                        />
                        B. useContext
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="q3"
                          value="c"
                          onChange={(e) =>
                            setQuizAnswers({
                              ...quizAnswers,
                              q3: e.target.value,
                            })
                          }
                        />
                        C. useState
                      </label>
                    </div>
                  </div>

                  <button
                    className="btn-submit-quiz"
                    onClick={handleQuizSubmit}
                  >
                    Nộp bài
                  </button>
                </>
              ) : (
                /* Quiz Result */
                <div className="quiz-result">
                  <div
                    className={`result-icon ${
                      showQuizResult.isPassed ? "success" : "failed"
                    }`}
                  >
                    {showQuizResult.isPassed ? "🎉" : "😔"}
                  </div>
                  <h2>
                    {showQuizResult.isPassed
                      ? "Chúc mừng! Bạn đã hoàn thành bài kiểm tra"
                      : "Chưa đạt yêu cầu"}
                  </h2>
                  <div className="score-display">
                    <div className="score-circle">
                      <div className="score-number">
                        {showQuizResult.score}/{showQuizResult.totalQuestions}
                      </div>
                      <div className="score-text">Điểm số</div>
                    </div>
                  </div>
                  <p className="result-message">
                    {showQuizResult.isPassed
                      ? "Xuất sắc! Bạn đã trả lời đúng tất cả các câu hỏi!"
                      : `Bạn cần trả lời đúng tất cả các câu hỏi để hoàn thành. Hãy thử lại!`}
                  </p>

                  <div className="quiz-result-actions">
                    <button className="btn-retry" onClick={handleRetryQuiz}>
                      🔄 Làm lại
                    </button>
                    {showQuizResult.isPassed && (
                      <button
                        className="btn-next-quiz"
                        onClick={handleNextLesson}
                      >
                        Bài tiếp →
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Coding Exercise */}
          {currentLesson?.type === "exercise" && currentExercise && (
            <div className="coding-exercise-container">
              <div className="exercise-header">
                <h2>💻 {currentExercise.title}</h2>
                <p className="exercise-description">
                  {currentExercise.description}
                </p>
                {currentExercise.difficulty && (
                  <span
                    className={`difficulty-badge ${currentExercise.difficulty}`}
                  >
                    {currentExercise.difficulty === "easy"
                      ? "🟢 Dễ"
                      : currentExercise.difficulty === "medium"
                      ? "🟡 Trung bình"
                      : "🔴 Khó"}
                  </span>
                )}
                <div className="exercise-meta">
                  <span>⭐ {currentExercise.points} điểm</span>
                  {currentExercise.timeLimit && (
                    <span>⏱️ {currentExercise.timeLimit} phút</span>
                  )}
                </div>
              </div>

              <CodeEditor
                language={currentExercise.language || "javascript"}
                initialCode={currentExercise.initialCode || ""}
                testCases={currentExercise.testCases || []}
                submitButtonText="Nộp bài"
                onSubmit={(result) => {
                  // Tự động hoàn thành bài tập khi nộp bài
                  handleLessonComplete();
                  if (result.passed) {
                    alert("🎉 Chúc mừng! Bạn đã hoàn thành bài tập!");
                  } else {
                    alert("⚠️ Bài làm chưa đạt. Hãy thử lại!");
                  }
                }}
              />

              {currentExercise.hints && currentExercise.hints.length > 0 && (
                <div className="exercise-hints">
                  <h4>💡 Gợi ý:</h4>
                  <ul>
                    {currentExercise.hints.map((hint, idx) => (
                      <li key={idx}>{hint}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Nếu lesson type là exercise nhưng chưa có data */}
          {currentLesson?.type === "exercise" && !currentExercise && (
            <div className="coding-exercise-container">
              <div className="exercise-placeholder">
                <p>⚠️ Bài tập đang được cập nhật...</p>
              </div>
            </div>
          )}

          {/* Comments Section */}
          <div className="lesson-comments">
            <h3>💬 Thảo luận ({lessonComments.length})</h3>
            {lessonComments.length > 0 ? (
              <div className="comments-list">
                {lessonComments.map((comment) => (
                  <div key={comment.id} className="comment-item">
                    <div className="comment-header">
                      <img
                        src={comment.userAvatar}
                        alt={comment.userName}
                        className="comment-avatar"
                      />
                      <div className="comment-meta">
                        <strong>{comment.userName}</strong>
                        <span className="comment-date">
                          {new Date(comment.createdAt).toLocaleDateString(
                            "vi-VN"
                          )}
                        </span>
                      </div>
                      {comment.rating && (
                        <div className="comment-rating">
                          {"⭐".repeat(comment.rating)}
                        </div>
                      )}
                    </div>

                    {editingComment === comment.id ? (
                      <div className="comment-edit-box">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          rows="3"
                        />
                        <div className="edit-actions">
                          <button
                            className="btn-save-edit"
                            onClick={() => handleSaveEdit(comment.id)}
                          >
                            ✓ Lưu
                          </button>
                          <button
                            className="btn-cancel-edit"
                            onClick={handleCancelEdit}
                          >
                            ✕ Hủy
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="comment-content">{comment.content}</div>
                    )}

                    <div className="comment-actions">
                      <button className="comment-like">
                        👍 {comment.likes || 0}
                      </button>
                      <button
                        className="comment-reply-btn"
                        onClick={() => handleReply(comment.id)}
                      >
                        💬 Trả lời
                      </button>
                      {comment.replies && comment.replies.length > 0 && (
                        <span className="comment-replies">
                          {comment.replies.length} phản hồi
                        </span>
                      )}

                      {comment.userId === user?.id ? (
                        <div className="comment-owner-actions">
                          <button
                            className="btn-edit-comment"
                            onClick={() => handleEditComment(comment)}
                            disabled={editingComment === comment.id}
                          >
                            ✏️ Sửa
                          </button>
                          <button
                            className="btn-delete-comment"
                            onClick={() => handleDeleteComment(comment.id)}
                          >
                            🗑️ Xóa
                          </button>
                        </div>
                      ) : (
                        <button
                          className="btn-report-comment"
                          onClick={() => handleReportComment(comment.id)}
                        >
                          🚩 Báo cáo
                        </button>
                      )}
                    </div>

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="comment-replies-list">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="comment-reply">
                            <img
                              src={reply.userAvatar}
                              alt={reply.userName}
                              className="reply-avatar"
                            />
                            <div className="reply-content">
                              <strong>{reply.userName}</strong>
                              <span className="reply-date">
                                {new Date(reply.createdAt).toLocaleDateString(
                                  "vi-VN"
                                )}
                              </span>
                              <p>{reply.content}</p>

                              {reply.userId === user?.id ? (
                                <button
                                  className="btn-delete-reply"
                                  onClick={() =>
                                    handleDeleteReply(comment.id, reply.id)
                                  }
                                >
                                  🗑️ Xóa
                                </button>
                              ) : (
                                <button
                                  className="btn-report-reply"
                                  onClick={() =>
                                    handleReportReply(comment.id, reply.id)
                                  }
                                >
                                  🚩 Báo cáo
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-comments">
                <p>
                  Chưa có bình luận nào. Hãy là người đầu tiên thảo luận về bài
                  học này! 💬
                </p>
              </div>
            )}

            <div className="add-comment-box">
              {replyingTo && (
                <div className="replying-to-banner">
                  <span>💬 Đang trả lời bình luận...</span>
                  <button
                    onClick={handleCancelReply}
                    className="cancel-reply-btn"
                  >
                    ✕
                  </button>
                </div>
              )}
              <div className="comment-input-wrapper">
                <textarea
                  placeholder={
                    replyingTo
                      ? "Viết phản hồi của bạn... (Nhập @ để mention)"
                      : "Viết bình luận của bạn... (Nhập @ để mention)"
                  }
                  rows="3"
                  value={newComment}
                  onChange={handleCommentChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                      handleAddComment();
                    }
                  }}
                />
                {showMentionDropdown && filteredMentions.length > 0 && (
                  <div className="mention-dropdown">
                    {filteredMentions.map((user, idx) => (
                      <div
                        key={idx}
                        className="mention-item"
                        onClick={() => handleSelectMention(user.username)}
                      >
                        <span className="mention-username">
                          @{user.username}
                        </span>
                        <span className="mention-name">{user.name}</span>
                        <span className="mention-role">{user.role}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="comment-actions-row">
                <small className="hint-text">
                  💡 Nhập @ để mention • Ctrl+Enter để gửi
                </small>
                <button
                  className="btn-submit-comment"
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                >
                  {replyingTo ? "Gửi phản hồi" : "Gửi bình luận"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Curriculum */}
        {showSidebar && (
          <div className="learn-sidebar">
            <div className="sidebar-header">
              <h3>Nội dung khóa học</h3>
              <div className="sidebar-progress">
                {completedLessons.length}/{totalLessons} bài học
              </div>
            </div>

            <div className="curriculum-sidebar">
              {curriculum.map((module, moduleIndex) => (
                <div key={moduleIndex} className="module-sidebar">
                  <div className="module-header-sidebar">
                    <span className="module-number">{moduleIndex + 1}</span>
                    <span className="module-title-sidebar">{module.title}</span>
                  </div>
                  <div className="lessons-sidebar">
                    {module.lessons.map((lesson, lessonIndex) => {
                      const isActive =
                        moduleIndex === currentModuleIndex &&
                        lessonIndex === currentLessonIndex;
                      const isCompleted = isLessonCompleted(lesson.id);
                      const isLocked = isLessonLocked(moduleIndex, lessonIndex);

                      return (
                        <div
                          key={lessonIndex}
                          className={`lesson-sidebar ${
                            isActive ? "active" : ""
                          } ${isCompleted ? "completed" : ""} ${
                            isLocked ? "locked" : ""
                          }`}
                          onClick={() => goToLesson(moduleIndex, lessonIndex)}
                          style={{
                            cursor: isLocked ? "not-allowed" : "pointer",
                            opacity: isLocked ? 0.6 : 1,
                          }}
                        >
                          <span className="lesson-icon">
                            {isLocked
                              ? "🔒"
                              : isCompleted
                              ? "✓"
                              : lesson.type === "video"
                              ? "▶"
                              : lesson.type === "exercise"
                              ? "💻"
                              : lesson.type === "quiz"
                              ? "📝"
                              : "📄"}
                          </span>
                          <span className="lesson-title-sidebar">
                            {lesson.title}
                          </span>
                          {lesson.duration && !isLocked && (
                            <span className="lesson-duration-sidebar">
                              {lesson.duration}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="report-modal-overlay" onClick={handleCancelReport}>
          <div
            className="report-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>🚩 Báo cáo vi phạm</h3>
            <p className="report-modal-description">
              Vui lòng chọn lý do báo cáo. Đội ngũ quản trị sẽ xem xét và xử lý
              nhanh nhất.
            </p>

            <div className="report-reasons">
              <label className="report-reason-option">
                <input
                  type="radio"
                  name="reportReason"
                  value="spam"
                  checked={reportReason === "spam"}
                  onChange={(e) => setReportReason(e.target.value)}
                />
                <div className="reason-content">
                  <strong>🚫 Spam</strong>
                  <span>Nội dung quảng cáo, spam liên tục</span>
                </div>
              </label>

              <label className="report-reason-option">
                <input
                  type="radio"
                  name="reportReason"
                  value="hate"
                  checked={reportReason === "hate"}
                  onChange={(e) => setReportReason(e.target.value)}
                />
                <div className="reason-content">
                  <strong>😡 Ngôn từ gây thù ghét</strong>
                  <span>Kỳ thị, xúc phạm cá nhân/nhóm người</span>
                </div>
              </label>

              <label className="report-reason-option">
                <input
                  type="radio"
                  name="reportReason"
                  value="answer-reveal"
                  checked={reportReason === "answer-reveal"}
                  onChange={(e) => setReportReason(e.target.value)}
                />
                <div className="reason-content">
                  <strong>🔓 Tiết lộ đáp án</strong>
                  <span>Chia sẻ đáp án bài tập, quiz</span>
                </div>
              </label>

              <label className="report-reason-option">
                <input
                  type="radio"
                  name="reportReason"
                  value="inappropriate"
                  checked={reportReason === "inappropriate"}
                  onChange={(e) => setReportReason(e.target.value)}
                />
                <div className="reason-content">
                  <strong>⚠️ Nội dung không phù hợp</strong>
                  <span>Nội dung nhạy cảm, bạo lực, phản cảm</span>
                </div>
              </label>

              <label className="report-reason-option">
                <input
                  type="radio"
                  name="reportReason"
                  value="offtopic"
                  checked={reportReason === "offtopic"}
                  onChange={(e) => setReportReason(e.target.value)}
                />
                <div className="reason-content">
                  <strong>📌 Không liên quan</strong>
                  <span>Nội dung không liên quan đến bài học</span>
                </div>
              </label>

              <label className="report-reason-option">
                <input
                  type="radio"
                  name="reportReason"
                  value="other"
                  checked={reportReason === "other"}
                  onChange={(e) => setReportReason(e.target.value)}
                />
                <div className="reason-content">
                  <strong>❓ Lý do khác</strong>
                  <span>Vi phạm quy định khác</span>
                </div>
              </label>
            </div>

            <div className="report-modal-actions">
              <button
                className="btn-cancel-report"
                onClick={handleCancelReport}
              >
                Hủy
              </button>
              <button
                className="btn-submit-report"
                onClick={handleSubmitReport}
                disabled={!reportReason}
              >
                Gửi báo cáo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseLearn;
