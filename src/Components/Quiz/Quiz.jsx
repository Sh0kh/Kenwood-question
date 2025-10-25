import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Question } from "../../utils/Controllers/Question";
import { Quizs } from "../../utils/Controllers/Quizs";
import Loading from "../UI/Loadings/Loading";
import { Card, CardBody, Typography, Button } from "@material-tailwind/react";
import { CheckCircle, ArrowRight } from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";

export default function Quiz() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [question, setQuestion] = useState(null);
    const [quizId, setQuizId] = useState(null);
    const [started, setStarted] = useState(false);
    const [results, setResults] = useState([]);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [finished, setFinished] = useState(false);
    const [questionAnimation, setQuestionAnimation] = useState("fade-in");
    // 🔹 Инициализация AOS
    useEffect(() => {
        AOS.init({ duration: 400, once: true });
    }, []);

    // 🔹 Получаем первый вопрос
    const getFirstQuestion = async () => {
        setLoading(true);
        try {
            const response = await Question?.GetFirsQuestion();
            setQuestion(response?.data?.data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    // 🔹 Начинаем квиз
    const StartQuiz = async () => {
        try {
            const response = await Quizs.StartQuiz({ customerId: id });
            setQuizId(response?.data?.quiz?.id);
            setStarted(true);
        } catch (error) {
            console.log(error);
        }
    };

    // 🔹 Получаем следующий вопрос с анимацией
    const getNextQuestion = async (next_question_id) => {
        try {
            setQuestionAnimation("fade-out");
            await new Promise(resolve => setTimeout(resolve, 300));

            setLoading(true);
            const response = await Question?.GetQuestionByid(next_question_id);
            setQuestion(response?.data?.data);
            setSelectedAnswer(null);

            setQuestionAnimation("fade-in");
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    // 🔹 Завершить квиз
    const EndQuiz = async (finalResults) => {
        try {
            console.log("Sending ALL results to server:", finalResults);
            await Quizs?.EndQuiz({ results: finalResults });
            setFinished(true);
        } catch (error) {
            console.log(error);
        }
    };

    const handleAnswerClick = async (answer) => {
        try {
            let currentQuizId = quizId;

            if (!started) {
                const res = await Quizs.StartQuiz({ customerId: id });
                const qid =
                    res?.quiz?.id ||
                    res?.data?.quiz?.id ||
                    res?.data?.data?.quiz?.id;

                if (!qid) {
                    console.error("❌ Quiz ID not found in response");
                    return;
                }

                currentQuizId = qid;
                setQuizId(qid);
                setStarted(true);
            }

            setSelectedAnswer(answer.id);

            // Создаем новый результат
            const newResult = {
                quizId: currentQuizId,
                questionId: question.id,
                questionText: question.text,
                answerId: answer.id,
                answerText: answer.text,
            };

            console.log("Adding new result:", newResult);

            // Обновляем результаты и обрабатываем логику перехода/завершения
            const updatedResults = [...results, newResult];
            setResults(updatedResults);

            // Ждем небольшое время для плавности анимации
            setTimeout(async () => {
                if (answer?.next_question_id) {
                    // Если есть следующий вопрос - переходим к нему
                    await getNextQuestion(answer.next_question_id);
                } else {
                    // Если вопросов больше нет - завершаем квиз
                    setQuestion(null);
                    await EndQuiz(updatedResults);
                }
            }, 600);

        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getFirstQuestion();
    }, []);

    if (loading) return <Loading />;

    // 🔹 Экран завершения
    if (finished) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="w-full max-w-2xl" data-aos="fade-up">
                    <Card className="shadow-md border border-gray-200 rounded-lg">
                        <CardBody className="p-8">
                            <div className="text-center mb-6">
                                <CheckCircle size={48} className="text-gray-700 mx-auto mb-4" />
                                <Typography variant="h4" className="font-normal text-gray-800 mb-2">
                                    Savollar tugadi
                                </Typography>
                                <Typography className="text-gray-600 text-sm">
                                    Barcha {results.length} ta javob saqlandi
                                </Typography>
                            </div>

                            <div className="mt-8">
                                <Typography variant="h6" className="font-medium text-gray-800 mb-4 border-b pb-2">
                                    Barcha javoblar:
                                </Typography>
                                <div className="space-y-4 max-h-80 overflow-y-auto">
                                    {results.map((r, i) => (
                                        <div
                                            key={i}
                                            className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="flex-shrink-0 w-6 h-6 bg-gray-800 text-white rounded-full flex items-center justify-center text-xs font-medium">
                                                    {i + 1}
                                                </div>
                                                <div className="flex-1">
                                                    <Typography className="font-medium text-gray-800 mb-1 text-sm">
                                                        {r.questionText}
                                                    </Typography>
                                                    <Typography className="text-gray-600 text-sm">
                                                        {r.answerText}
                                                    </Typography>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </div>
        );
    }

    // 🔹 Основной экран
    return (
        <div className="min-h-screen flex items-start justify-start py-6">
            <div className="w-full space-y-6">
                {/* Question Card */}
                <Card
                    className={`shadow-sm border border-gray-200 rounded-lg transition-all duration-300 ${questionAnimation === "fade-out" ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
                        }`}
                    data-aos="fade-up"
                >
                    <CardBody className="p-6">
                        <Typography variant="h5" className="font-normal text-gray-900 leading-relaxed">
                            {question?.text}
                        </Typography>
                    </CardBody>
                </Card>

                {/* Answers Card */}
                <Card
                    className="shadow-sm border border-gray-200 rounded-lg"
                    data-aos="fade-up"
                    data-aos-delay="100"
                >
                    <CardBody className="p-6">
                        <div className="space-y-3">
                            {question?.answers?.map((answer, index) => (
                                <Button
                                    key={answer.id}
                                    variant={selectedAnswer === answer.id ? "filled" : "outlined"}
                                    className={`
                                        w-full justify-start text-left normal-case font-normal
                                        py-4 px-4 rounded-lg border transition-all duration-200
                                        ${selectedAnswer === answer.id
                                            ? "bg-gray-800 text-white border-gray-800 shadow-sm"
                                            : "bg-white text-gray-800 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                                        }
                                        ${selectedAnswer && selectedAnswer !== answer.id ? "opacity-60" : ""}
                                    `}
                                    onClick={() => handleAnswerClick(answer)}
                                    disabled={!!selectedAnswer}
                                >
                                    <div className="flex items-center justify-between w-full">
                                        <span className="text-base">{answer.text}</span>
                                        {selectedAnswer === answer.id && (
                                            <CheckCircle size={20} className="flex-shrink-0 ml-2" />
                                        )}
                                    </div>
                                </Button>
                            ))}
                        </div>

                        {/* Progress Info */}

                    </CardBody>
                </Card>
            </div>
        </div>
    );
}