import { NavLink, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Customer } from "../../utils/Controllers/Customer";
import Loading from "../UI/Loadings/Loading";
import {
    Card,
    CardBody,
    Typography,
    Button,
} from "@material-tailwind/react";
import {
    User,
    Phone,
    StickyNote,
    CalendarDays,
    ArrowLeft,
} from "lucide-react";
import EmptyData from "../UI/NoData/EmptyData";

export default function ClientDetail() {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [client, setClient] = useState(null);

    const GetClientDetail = async () => {
        setLoading(true);
        try {
            const response = await Customer?.GetCustomerDetail(id);
            setClient(response?.data?.customer);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        GetClientDetail();
    }, []);

    if (loading) return <Loading />;

    if (!client) {
        return <EmptyData text={"Ma'lumot topilmadi"} />;
    }

    return (
        <div className="py-8">
            <div className="flex items-center justify-between gap-3 mb-6">
                <Typography variant="h4" className="font-bold">
                    Klient tafsilotlari
                </Typography>
                <NavLink to={`/quiz/${id}`}>
                    <Button>Savol javob boshlash</Button>
                </NavLink>
            </div>

            {/* Основная информация о клиенте */}
            <Card className="shadow-lg rounded-2xl border border-gray-200 max-w-lg mb-8">
                <CardBody className="space-y-5">
                    <div className="flex items-center gap-3">
                        <User className="text-blue-600" size={24} />
                        <div>
                            <Typography variant="h6">To‘liq ism</Typography>
                            <Typography color="blue-gray" className="font-medium">
                                {client.fullName}
                            </Typography>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Phone className="text-green-600" size={24} />
                        <div>
                            <Typography variant="h6">Telefon raqam</Typography>
                            <Typography color="blue-gray" className="font-medium">
                                {client.phone}
                            </Typography>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <StickyNote className="text-orange-600" size={24} />
                        <div>
                            <Typography variant="h6">Izoh</Typography>
                            <Typography color="blue-gray" className="font-medium">
                                {client.note || "Izoh mavjud emas"}
                            </Typography>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <CalendarDays className="text-purple-600" size={24} />
                        <div>
                            <Typography variant="h6">Yaratilgan sana</Typography>
                            <Typography color="blue-gray" className="font-medium">
                                {new Date(client.createdAt).toLocaleString()}
                            </Typography>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <CalendarDays className="text-indigo-600" size={24} />
                        <div>
                            <Typography variant="h6">Yangilangan sana</Typography>
                            <Typography color="blue-gray" className="font-medium">
                                {new Date(client.updatedAt).toLocaleString()}
                            </Typography>
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* Список викторин */}
            <Typography variant="h5" className="mb-4 font-semibold">
                Viktorinalar ({client.quizzes?.length || 0})
            </Typography>

            {client.quizzes?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {client.quizzes.map((quiz, index) => (
                        <NavLink state={{ clientDate: client }} to={`/quiz/detail/${quiz?.id}`}>
                            <Card
                                key={quiz.id}
                                className="relative p-3 border border-gray-100 shadow-md rounded-xl hover:shadow-lg transition"
                            >
                                {/* Номер карточки */}
                                <div className="absolute -top-2 -left-2 bg-blue-600 text-white w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold shadow-md">
                                    {index + 1}
                                </div>

                                <CardBody>
                                    <Typography
                                        variant="small"
                                        color="blue-gray"
                                        className="font-medium mt-1"
                                    >
                                        <strong>Yaratilgan sana:</strong>{" "}
                                        {new Date(quiz.createdAt).toLocaleString()}
                                    </Typography>
                                </CardBody>
                            </Card>
                        </NavLink>
                    ))}
                </div>
            ) : (
                <EmptyData text={"Viktorina topilmadi"} />
            )}

        </div>
    );
}
