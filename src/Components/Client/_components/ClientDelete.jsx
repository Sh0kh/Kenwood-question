import {
    Button,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Typography,
} from "@material-tailwind/react";
import { useState } from "react";
import Delete from "../../UI/Icons/Delete";
import { Customer } from "../../../utils/Controllers/Customer";
import { Alert } from "../../../utils/Alert";
import { Loader2 } from "lucide-react";

export default function ClientDelete({ id, refresh }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleOpen = () => setOpen(!open);

    const DeleteCustomer = async () => {
        setLoading(true);
        try {
            const response = await Customer?.DeleteCustomer(id);
            Alert("Mijoz muvaffaqiyatli o‘chirildi", "success");
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
            {/* O‘chirish tugmasi */}
            <Button
                color="red"
                variant="text"
                onClick={handleOpen}
                className="p-2 min-w-0"
            >
                <Delete size={'25px'} />
            </Button>

            {/* Tasdiqlash oynasi */}
            <Dialog open={open} handler={handleOpen} size="xs">
                <DialogHeader>
                    <Typography variant="h6" color="red">
                        Mijozni o‘chirish
                    </Typography>
                </DialogHeader>

                <DialogBody className="pt-[1px]">
                    <Typography>
                        Siz bu mijozni o‘chirmoqchimisiz? Bu amalni qaytarib
                        bo‘lmaydi.
                    </Typography>
                </DialogBody>

                <DialogFooter className="flex justify-end gap-2">
                    <Button
                        variant="text"
                        color="blue-gray"
                        onClick={handleOpen}
                        disabled={loading}
                    >
                        Bekor qilish
                    </Button>
                    <Button
                        color="red"
                        onClick={DeleteCustomer}
                        disabled={loading}
                        className="flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                O‘chirilmoqda...
                            </>
                        ) : (
                            "O‘chirish"
                        )}
                    </Button>
                </DialogFooter>
            </Dialog>
        </>
    );
}
