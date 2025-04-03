import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { SurveyService } from "../../../api/services/surveyService";
import { toast } from "react-toastify";
import {
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@mui/material";
import { Close, NavigateBefore, NavigateNext } from "@mui/icons-material";
import { motion } from "framer-motion";
const SurveyDetail = () => {
  const { id } = useParams();
  const [survey, setSurvey] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const questionsPerPage = 7;
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editedAnswers, setEditedAnswers] = useState({});
  const [editedQuestionContent, setEditedQuestionContent] = useState("");
  const [editedSurvey, setEditedSurvey] = useState(null);

  useEffect(() => {
    async function fetchSurvey() {
      const data = await SurveyService.getSurveyContent(id);
      if (data) {
        setSurvey(data);
        setEditedSurvey(data);
      }
    }
    fetchSurvey();
  }, [id]);

  const showAnswers = (question) => {
    setSelectedQuestion(question);
    setEditedAnswers(
      question.answers.reduce((acc, answer) => {
        acc[answer.answerId] = answer.content;
        return acc;
      }, {})
    );
    setEditedQuestionContent(question.content);
    setIsModalOpen(true);
  };

  const handleEditAnswer = (answerId, newContent) => {
    setEditedAnswers({ ...editedAnswers, [answerId]: newContent });
  };

  const saveAnswers = () => {
    if (!selectedQuestion) return;

    const updatedAnswers = selectedQuestion.answers.map((answer) => ({
      ...answer,
      content: editedAnswers[answer.answerId],
    }));

    const updatedQuestions = editedSurvey.questions.map((q) =>
      q.questionId === selectedQuestion.questionId
        ? { ...q, content: editedQuestionContent, answers: updatedAnswers }
        : q
    );

    setEditedSurvey({ ...editedSurvey, questions: updatedQuestions });

    setIsModalOpen(false);
  };

  const handleSaveSurvey = async () => {
    try {
      const updatedSurvey = {
        ...editedSurvey,
        updateAt: new Date().toISOString(),
        createAt: survey.createAt,
      };

      console.log("Final JSON Data:", JSON.stringify(updatedSurvey, null, 2));
      await SurveyService.updateSurvey(id, updatedSurvey);
      toast.success("Survey updated successfully!");
    } catch (error) {
      toast.error("Failed to update survey. Check console for details.", error);
    }
  };

  if (!survey) {
    return (
      <div className="p-6 text-lg text-center font-semibold">Loading...</div>
    );
  }

  const totalPages = Math.ceil(survey.questions.length / questionsPerPage);
  const currentQuestions = editedSurvey.questions.slice(
    (currentPage - 1) * questionsPerPage,
    currentPage * questionsPerPage
  );

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-center p-6"
      >
        <Card className="max-w-2xl w-full shadow-xl rounded-xl">
          <CardContent>
            <Typography variant="h4" className="font-extrabold text-center">
              📝 Edit Survey
            </Typography>
            <Typography variant="h5" className="font-semibold text-center mt-4">
              Questions
            </Typography>

            <div className="mt-4 space-y-4">
              {currentQuestions.map((question) => (
                <motion.div
                  key={question.questionId}
                  whileHover={{ scale: 1.02 }}
                  className="border border-gray-300 bg-white shadow-lg rounded-lg p-4 cursor-pointer"
                  onClick={() => showAnswers(question)}
                >
                  <Typography color="primary" className="font-medium">
                    {question.content}
                  </Typography>
                </motion.div>
              ))}
            </div>

            <div className="flex justify-center mt-6 space-x-4">
              <Button
                variant="contained"
                startIcon={<NavigateBefore />}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Typography className="text-lg font-semibold">
                {currentPage} / {totalPages}
              </Typography>
              <Button
                variant="contained"
                endIcon={<NavigateNext />}
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>

            <div className="flex justify-center mt-6">
              <Button
                variant="contained"
                color="success"
                onClick={handleSaveSurvey}
              >
                Save Survey
              </Button>
            </div>
          </CardContent>
        </Card>

        <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <DialogTitle>
            Edit Question
            <IconButton
              onClick={() => setIsModalOpen(false)}
              style={{ position: "absolute", right: 10, top: 10 }}
            >
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              value={editedQuestionContent}
              onChange={(e) => setEditedQuestionContent(e.target.value)}
              variant="outlined"
              margin="dense"
            />

            <div className="mt-4 max-h-80 overflow-y-auto space-y-2">
              {selectedQuestion?.answers.length > 0 ? (
                selectedQuestion.answers.map((answer) => (
                  <TextField
                    key={answer.answerId}
                    fullWidth
                    value={editedAnswers[answer.answerId]}
                    onChange={(e) =>
                      handleEditAnswer(answer.answerId, e.target.value)
                    }
                    variant="outlined"
                    margin="dense"
                    label={`Points: ${answer.point}`}
                  />
                ))
              ) : (
                <Typography className="text-gray-500 text-center mt-4">
                  No answers available.
                </Typography>
              )}
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsModalOpen(false)} color="secondary">
              Cancel
            </Button>
            <Button color="primary" variant="contained" onClick={saveAnswers}>
              Save Answers
            </Button>
          </DialogActions>
        </Dialog>
      </motion.div>
    </>
  );
};

export default SurveyDetail;
