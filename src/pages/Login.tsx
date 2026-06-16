import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom"
import sha256 from "../utils/hash";
import { supabase } from "../utils/supabase";
import toast from "react-hot-toast"

const version = "V-" + import.meta.env.VITE_PAGE_VERSION

function Login() {
    const navigate = useNavigate()
    
    const [searchParams] = useSearchParams()
    const [user, setUser] = useState<string>();
    const [password, setPassword] = useState<string>();

    useEffect(() => {
        localStorage.removeItem("user")
        const utmRR = searchParams.get("utm-rr")
        if (utmRR) {
            toast.success(
                "Usuario registrado correctamente. Ya puedes ingresar y disfrutar de la rifa."
            )
        }
    }, [])

    async function validateUser() {
        const pass_hash = await sha256(password);
        const { data } = await supabase.rpc(
            "login_user",
            {
                p_user: user,
                p_password_hash: pass_hash,
            }
        )
        if(data.length > 0){
            data[0].ttl = Date.now() + 5 * 60 * 60 * 1000;
            const json_data = JSON.stringify(data[0])
            window.localStorage.setItem('user', json_data)
            navigate("/home?user-id="+data[0].id)
        } else {
            alert('Usuario o Contraseña Erroneas')
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-900">
            <div className="bg-zinc-800 p-8 rounded-2xl w-80">
                <h1 className="text-white text-3xl text-center font-bold mb-6">
                    Gran Rifa Mundialista ⚽
                </h1>

                <input
                    className="w-full p-3 rounded-lg mb-4"
                    placeholder="username o mail"
                    onChange={(event) => setUser(event.target.value)}
                />

                <input
                    type="password"
                    className="w-full p-3 rounded-lg mb-4"
                    placeholder="contraseña"
                    onChange={(event) => setPassword(event.target.value)}
                />

                <button
                    onClick={validateUser}
                    className="w-full bg-green-500 text-white p-3 rounded-lg"
                >
                    Entrar
                </button>
            </div>
            <p className="text-xs mt-4">{version}</p>
        </div>
    )
}

export default Login