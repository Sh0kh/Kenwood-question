import { useEffect, useState } from "react";
import { Customer } from "../../utils/Controllers/Customer";
import ClientCreate from "./_components/ClientCreate";
import Loading from "../UI/Loadings/Loading";
import { Button, Card, CardBody, Typography } from "@material-tailwind/react";
import { User, Phone, StickyNote, Calendar } from "lucide-react";
import EmptyData from "../UI/NoData/EmptyData";
import ClientDelete from "./_components/ClientDelete";
import ClientEdit from "./_components/ClientEdit";
import { NavLink } from "react-router-dom";
import Eye from "../UI/Icons/Eye";

export default function Client() {
    const [loading, setLoading] = useState(true);
    const [clients, setClients] = useState([]);

    const getAllClients = async () => {
        setLoading(true);
        try {
            const response = await Customer?.GetCustomer();
            setClients(response?.data?.customers || []);
        } catch (error) {
            console.log("❌ Mijozlarni olishda xatolik:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getAllClients();
    }, []);

    if (loading) return <Loading />;

    return (
        <div className="py-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-[30px] font-bold">Klientlar</h2>
                <ClientCreate refresh={getAllClients} />
            </div>
            {clients.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {clients.map((client) => (
                        <Card
                            key={client.id}
                            className="shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200"
                        >
                            <CardBody>
                                <Typography
                                    variant="h5"
                                    color="blue-gray"
                                    className="flex items-center gap-2 mb-2 font-semibold"
                                >
                                    <User size={20} /> {client.fullName}
                                </Typography>

                                <Typography
                                    className="flex items-center gap-2 text-gray-700 mb-1"
                                >
                                    <Phone size={18} /> {client.phone}
                                </Typography>

                                <Typography
                                    className="flex items-center gap-2 text-gray-600 mb-1"
                                >
                                    <StickyNote size={18} />{" "}
                                    {client.note || "Izoh mavjud emas"}
                                </Typography>

                                <Typography
                                    className="flex items-center gap-2 text-gray-500 text-sm"
                                >
                                    <Calendar size={18} />{" "}
                                    {new Date(client.createdAt).toLocaleDateString("uz-UZ")}
                                </Typography>
                                <div className="flex items-center gap-[10px] mt-[10px]">
                                    <ClientEdit refresh={getAllClients} data={client} />
                                    <ClientDelete refresh={getAllClients} id={client?.id} />
                                    <NavLink to={`/client/${client?.id}`}>
                                        <Button
                                            color="blue"
                                            variant="text"
                                            className="p-2 min-w-0"
                                        >
                                            <Eye size={'25px'} />
                                        </Button>
                                    </NavLink>
                                </div>
                            </CardBody>
                        </Card>
                    ))}
                </div>
            ) : (
                <EmptyData text={"Klient mavjud emas"} />
            )}
        </div>
    );
}
