import {
    Button,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Input,
    Textarea,
} from "@material-tailwind/react";
import { useState } from "react";
import { Customer } from "../../../utils/Controllers/Customer";
import { Alert } from "../../../utils/Alert";
import { Loader2 } from "lucide-react"; // 🌀 Spinner ikonkasi

export default function ClientCreate({ refresh }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({
        fullName: "",
        phone: "+998",
        note: "",
    });

    const handleOpen = () => setOpen(!open);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData((prev) => ({ ...prev, [name]: value }));
    };

    const CreateClient = async () => {
        setLoading(true);
        try {
            const response = await Customer?.CreateCustomer(data);
            Alert("Muvaffaqiyatli yaratildi", "success");
            setOpen(false);
            refresh();
            setData({ fullName: "", phone: "+998", note: "" });
        } catch (error) {
            Alert("Xatolik yuz berdi", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Modalni ochuvchi tugma */}
            <Button onClick={handleOpen}>
                Yaratish
            </Button>

            {/* Modal oynasi */}
            <Dialog open={open} handler={handleOpen} size="sm">
                <DialogHeader>Yangi mijoz yaratish</DialogHeader>

                <DialogBody className="flex flex-col gap-4">
                    <Input
                        label="To‘liq ism"
                        name="fullName"
                        value={data.fullName}
                        onChange={handleChange}
                    />
                    <Input
                        label="Telefon raqami"
                        name="phone"
                        value={data.phone}
                        onChange={handleChange}
                        placeholder="+998 (90) 123-45-67"
                    />
                    <Textarea
                        label="Izoh"
                        name="note"
                        value={data.note}
                        onChange={handleChange}
                    />
                </DialogBody>

                <DialogFooter className="flex justify-end gap-2">
                    <Button
                        variant="text"
                        color="red"
                        onClick={handleOpen}
                        disabled={loading}
                    >
                        Bekor qilish
                    </Button>

                    <Button
                        color="green"
                        onClick={CreateClient}
                        disabled={loading}
                        className="flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Saqlanmoqda...
                            </>
                        ) : (
                            "Saqlash"
                        )}
                    </Button>
                </DialogFooter>
            </Dialog>
        </>
    );
}
