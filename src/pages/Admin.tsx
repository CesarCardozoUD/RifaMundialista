import { useState } from "react"
import { useNavigate } from "react-router-dom"
import sha256 from "../utils/hash"
import { supabase } from "../utils/supabase"

function Admin() {
    const navigate = useNavigate()

    const pku = import.meta.env.VITE_HASHED_PKU
    const pkp = import.meta.env.VITE_HASHED_PKP

    const [user, setUser] = useState<string>();
    const [password, setPassword] = useState<string>();
    const [uuid, setUuid] = useState<string>();
    const [newUser, setNewUser] = useState<string>();

    async function validateAdmin() {
        const user_hash = await sha256(user);
        const pass_hash = await sha256(password);
        if (user_hash === pku && pass_hash === pkp) {
            return true
        } else {
            return false
        }
    }

    async function initUser() {
        if (await validateAdmin()) {
            const { data, error } = await supabase.rpc(
                "init_user"
            )
            if(data){
                setNewUser(data)
            }else{
                alert(error)
            }
        }
    }

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl">

                <div className="mb-8">
                    <h1 className="text-4xl font-black text-white mb-2">
                        Admin Panel ⚽
                    </h1>

                    <p className="text-zinc-400">
                        Gestión interna del mundial
                    </p>
                    <p className="text-zinc-400">
                        {newUser}
                    </p>
                </div>

                <div className="space-y-5">

                    <div>
                        <label className="block text-sm text-zinc-400 mb-2">
                            ADMIN USER
                        </label>

                        <input
                            placeholder="admin username"
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-4 py-3 text-white outline-none focus:border-emerald-500 transition-colors"
                            onChange={(event) => setUser(event.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-zinc-400 mb-2">
                            ADMIN PASS
                        </label>

                        <input
                            type="password"
                            placeholder="admin pass"
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-4 py-3 text-white outline-none focus:border-emerald-500 transition-colors"
                            onChange={(event) => setPassword(event.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-zinc-400 mb-2">
                            UUID USER
                        </label>

                        <input
                            placeholder="uuid to edit"
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-4 py-3 text-white outline-none focus:border-emerald-500 transition-colors"
                            onChange={(event) => setUuid(event.target.value)}
                        />
                    </div>

                </div>

                <div className="mt-8 space-y-3">

                    <button
                        className="w-full bg-emerald-500 hover:bg-emerald-400 transition-colors text-white font-bold py-3 rounded-2xl"
                        onClick={initUser}
                    >
                        Inicializar User
                    </button>

                    <button
                        className="w-full bg-amber-500 hover:bg-amber-400 transition-colors text-white font-bold py-3 rounded-2xl"
                    >
                        Deshabilitar User
                    </button>

                    <button
                        className="w-full bg-red-500 hover:bg-red-400 transition-colors text-white font-bold py-3 rounded-2xl"
                    >
                        Restablecer Contraseña
                    </button>

                </div>
            </div>
        </div>
    )
}

export default Admin
