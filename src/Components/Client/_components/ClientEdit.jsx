import {
    Button,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Input,
    Textarea,
    Typography,
} from "@material-tailwind/react";
import { useState } from "react";
import Edit from "../../UI/Icons/Edit";
import { Customer } from "../../../utils/Controllers/Customer";
import { Alert } from "../../../utils/Alert";
import { Loader2 } from "lucide-react";

export default function ClientEdit({ refresh, data }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        fullName: data?.fullName || "",
        phone: data?.phone || "+998",
        note: data?.note || "",
    });

    const handleOpen = () => setOpen(!open);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const EditCustomer = async () => {
        setLoading(true);
        try {
            await Customer?.EditCustomer(form, data?.id);
            Alert("Mijoz ma’lumotlari yangilandi", "success");
            setOpen(false);
            refresh && refresh();
        } catch (error) {
            Alert("Xatolik yuz berdi", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Edit tugmasi */}
            <Button
                color="yellow"
                variant="text"
                onClick={handleOpen}
                className="p-2 min-w-0"
            >
                <Edit size={"25px"} />
            </Button>

            {/* Edit modal */}
            <Dialog open={open} handler={handleOpen} size="sm">
                <DialogHeader>
                    <Typography variant="h5">Mijozni tahrirlash</Typography>
                </DialogHeader>

                <DialogBody className="flex flex-col gap-4">
                    <Input
                        label="To‘liq ism"
                        name="fullName"
                        value={form.fullName}
                        onChange={handleChange}
                    />
                    <Input
                        label="Telefon raqami"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                    />
                    <Textarea
                        label="Izoh"
                        name="note"
                        value={form.note}
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
                        onClick={EditCustomer}
                        disabled={loading}
                        className="flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Saqlanmoqda...
                            </>
                        ) : (
                            "Yangilash"
                        )}
                    </Button>
                </DialogFooter>
            </Dialog>
        </>
    );
}
