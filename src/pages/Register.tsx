import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import sha256 from "../utils/hash"
import { supabase } from "../utils/supabase"
import toast from "react-hot-toast"

function Register() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const userId = searchParams.get("user-id")
    const isRestore = searchParams.get("restore")
    const ttl = searchParams.get("ttl")
    const restoreMode = isRestore === "true" && ttl !== null

    if (!userId || userId === "") {
        navigate("/error?error-id=E-404")
    }


    const [username, setUsername] = useState("")
    const [mail, setMail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPass, setConfirmPass] = useState("")
    const [isLoading, setIsLoading] = useState(false);
    
    
    const [isValidForm, setIsValidForm] = useState(
        [false, false, false]
    )

    async function activateAccount() {
        validateForm(true)
        if (restoreMode) {
            setIsValidForm([
                true,
                true,
                isValidForm[2]
            ])
        }


        if (isValidForm[0] && isValidForm[1] && isValidForm[2]) {
            setIsLoading(true)
            const hashedPassword = await sha256(password.trim());
            let errorExec = null

            if (restoreMode) {
                const { error } = await supabase.rpc(
                    'restore_pass',
                    {
                        p_user_id: userId,
                        p_password_hash: hashedPassword
                    }
                )
                errorExec = error;
            } else {
                const { error } = await supabase.rpc(
                    'activate_user',
                    {
                        p_user_id: userId,
                        p_mail: mail.trim(),
                        p_username: username.trim(),
                        p_password_hash: hashedPassword
                    }
                )
                errorExec = error;
            }

            if (errorExec) {
                navigate("/error?error-id=E-001")
            }
            setIsLoading(false)
            navigate("/login?utm-rr=true")
        }
    }

    function validateForm(notify: boolean) {
        const isPasswordValid = (password === confirmPass) && password.length > 8;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        const userRegex = /^[a-zA-Z0-9_]+$/
        setIsValidForm(
            [
                username.trim() !== "" && userRegex.test(username.trim()),
                mail.trim() !== "" && emailRegex.test(mail.trim()),
                password.trim() !== "" && isPasswordValid
            ]
        )
        if (notify && !restoreMode) {
            if (!isValidForm[0]) {
                toast.error("Verifica que tu username esté bien escrito y no use caracteres especiales.")
            }
            if (!isValidForm[1]) {
                toast.error("Verifica que tu email sea valido 'mail@ejemplo.com'.")
            }
            if (!isValidForm[2]) {
                if (password.length < 8) {
                    toast.error("Verifica que tu contraseña tenga más de 8 caracteres.")
                }
                if (password === confirmPass) {
                    toast.error("Verifica la contraseña y la confirmación de la contraseña sean la misma.")
                }
            }
        }
    }

    useEffect (() => {
        if((Number(ttl) < Date.now()) && restoreMode){
            navigate("/error?error-id=E-001")
        }
    }, [])

    useEffect(() => {

        validateForm(false)
    }, [username, mail, password, confirmPass])

    return (

        <div className=" min-h-screen bg-zinc-950 flex items-center justify-center px-4 ">
            <div className=" w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-8 ">
                <h1 className=" text-3xl font-bold text-white mb-2 ">
                    {restoreMode ? 'Restaurar Contraseña' : 'Crear cuenta'}
                </h1>

                <p className="text-zinc-400mb-8">
                    {restoreMode ? 'Ingresa tu nueva Contraseña' : 'Completa tus datos para ingresar.'}
                </p>
                <br />

                <div className="space-y-4">
                    {
                        !restoreMode &&
                        <input
                            placeholder="Username"
                            value={username}
                            onChange={(e) =>
                                setUsername(e.target.value)
                            }
                            className={`w-full bg-zinc-800 border ${isValidForm[0] ? "border-zinc-700 " : "border-red-500"} rounded-2xl px-4 py-3 text-white outline-none`}
                        />
                    }

                    {
                        !restoreMode &&
                        <input
                            placeholder="Mail"
                            value={mail}
                            onChange={(e) =>
                                setMail(e.target.value)
                            }
                            className={`w-full bg-zinc-800 border ${isValidForm[1] ? "border-zinc-700 " : "border-red-500"} rounded-2xl px-4 py-3 text-white outline-none`}
                        />
                    }
                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                        className={`w-full bg-zinc-800 border ${isValidForm[2] ? "border-zinc-700 " : "border-red-500"} rounded-2xl px-4 py-3 text-white outline-none`}
                    />
                    <input
                        type="password"
                        placeholder="Confirmar Contraseña"
                        value={confirmPass}
                        onChange={(e) =>
                            setConfirmPass(e.target.value)
                        }
                        className={`w-full bg-zinc-800 border ${isValidForm[2] ? "border-zinc-700 " : "border-red-500"} rounded-2xl px-4 py-3 text-white outline-none`}
                    />

                    <br />
                    <button
                        className=" w-full bg-emerald-500 hover:bg-emerald-400 transition-colors text-white font-bold py-4 rounded-2xl cursor-pointer"
                        disabled={isLoading}
                        onClick={activateAccount}
                    >
                        {
                            isLoading
                                ? 'Procesando...'
                                : restoreMode
                                    ? 'Cambiar contraseña'
                                    : 'Activar cuenta'
                        }
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Register