import { useParams } from "react-router-dom";
import { Quizs } from "../../utils/Controllers/Quizs";
import { useEffect, useState } from "react";
import { Card, CardBody, Typography, Button } from "@material-tailwind/react";
import { Download, Calendar, FileText, User, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Loading from "../UI/Loadings/Loading";
import html2pdf from "html2pdf.js";

export default function QuizDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);

    const getResult = async () => {
        try {
            setLoading(true);
            const response = await Quizs?.GetResult(id);
            setResults(response?.data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const exportToPDF = () => {
        const pdfContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 20px;
                        color: #000;
                        background: #fff;
                        line-height: 1.6;
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 30px;
                        padding-bottom: 20px;
                        border-bottom: 1px solid #ddd;
                    }
                    .result-item {
                        margin-bottom: 25px;
                        padding-bottom: 20px;
                        border-bottom: 1px solid #eee;
                    }
                    .question-number {
                        font-weight: bold;
                        font-size: 16px;
                        margin-bottom: 5px;
                        color: #000;
                    }
                    .question {
                        font-size: 14px;
                        margin-bottom: 10px;
                        color: #333;
                    }
                    .answer {
                        font-size: 14px;
                        color: #666;
                        margin-left: 10px;
                    }
                    .summary {
                        margin-top: 30px;
                        margin-bottom:60px;
                        padding-top: 20px;
                        border-top: 1px solid #ddd;
                        text-align: center;
                    }
                    .meta {
                        font-size: 12px;
                        color: #888;
                        margin-top: 5px;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Natijalari</h1>
                </div>

                ${results.results.map((result, index) => `
                    <div class="result-item">
                        <div class="question-number">${index + 1}. Savol</div>
                        <div class="question">${result.questionText}</div>
                        <div class="answer"><strong>Javob:</strong> ${result.answerText}</div>
                    </div>
                `).join('')}

                <div class="summary">
                    <div><strong>Yakuniy hisobot</strong></div>
                    <div>Barcha ${results.results.length} ta savolga javob berildi</div>
                </div>
            </body>
            </html>
        `;

        const options = {
            margin: [15, 15, 15, 15],
            filename: `quiz-results-${id}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff'
            },
            jsPDF: {
                unit: 'mm',
                format: 'a4',
                orientation: 'portrait'
            }
        };

        html2pdf().set(options).from(pdfContent).save();
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('uz-UZ', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    useEffect(() => {
        getResult();
    }, []);

    if (loading) return <Loading />;

    if (!results?.results?.length) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-white">
                <Card className="w-full max-w-md shadow-none border">
                    <CardBody className="text-center p-8">
                        <FileText size={48} className="text-gray-600 mx-auto mb-4" />
                        <Typography variant="h5" className="text-gray-600 mb-2">
                            Natijalar topilmadi
                        </Typography>
                        <Button
                            onClick={() => navigate(-1)}
                            className="mt-4 bg-black text-white"
                        >
                            Orqaga qaytish
                        </Button>
                    </CardBody>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8">
            <div className="container mx-auto">
                {/* Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
                    <div className="flex items-center gap-4">
                        <div>
                            <Typography variant="h3" className="font-bold text-black">
                                Quiz Natijalari
                            </Typography>
                            <Typography className="text-gray-600 mt-1">
                                Barcha savol va javoblar
                            </Typography>
                        </div>
                    </div>

                    <Button
                        onClick={exportToPDF}
                        className="bg-black text-white hover:bg-gray-800 flex items-center gap-2 border border-black"
                    >
                        <Download size={20} />
                        PDF Yuklab olish
                    </Button>
                </div>

                {/* Results List */}
                <div className="space-y-6">
                    {results.results.map((result, index) => (
                        <Card
                            key={result.id}
                            className="border border-gray-200 rounded-lg shadow-none"
                        >
                            <CardBody className="p-6">
                                <div className="mb-2">
                                    <Typography variant="h6" className="font-semibold text-black">
                                        {index + 1}. Savol
                                    </Typography>
                                </div>
                                <Typography className="text-gray-800 text-base mb-4">
                                    {result.questionText}
                                </Typography>
                                <div className="bg-gray-50 p-3 rounded">
                                    <Typography className="text-gray-700 text-base">
                                        <strong>Javob:</strong> {result.answerText}
                                    </Typography>
                                </div>
                            </CardBody>
                        </Card>
                    ))}
                </div>

                {/* Summary */}
                <Card className="mt-8 bg-white border border-gray-200">
                    <CardBody className="p-6">
                        <div className="text-center">
                            <Typography variant="h5" className="font-bold text-black mb-2">
                                Yakuniy hisobot
                            </Typography>
                            <Typography className="text-gray-600">
                                Barcha {results.results.length} ta savolga javob berildi
                            </Typography>
                        </div>
                    </CardBody>
                </Card>

                {/* Floating PDF Button for Mobile */}
                <div className="lg:hidden fixed bottom-6 right-6">
                    <Button
                        onClick={exportToPDF}
                        className="bg-black text-white rounded-full w-12 h-12 flex items-center justify-center border border-black"
                    >
                        <Download size={20} />
                    </Button>
                </div>
            </div>
        </div>
    );
}