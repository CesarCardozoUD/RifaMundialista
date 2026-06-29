import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../utils/supabase"
import facts from "../utils/fun-facts.json"

interface User {
    id: string
    username: string
    mail: string
}

interface LeaderboardUser {
    username: string
    points: number
}

function Home() {

    const navigate = useNavigate()

    const [user, setUser] = useState<User | null>(null)
    const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([])
    const [prizePool, setPrizePool] = useState(0)
    const [score, setScore] = useState(0)
    const [predictionsCount, setPredictionsCount] = useState(0)
    const [totalMatches, setTotalMatches] = useState(0)
    const [funFacts, setFunFacts] = useState([])

    useEffect(() => {
        const localUser = localStorage.getItem("user")
        if (!localUser) {
            navigate("/")
            return
        }

        const parsedUser = JSON.parse(localUser)

        const today = new Date()
            .toISOString()
            .split("T")[0]

        const todayFact = facts.filter(
            item => item.fecha === today
        )

        setFunFacts(todayFact)
        setUser(parsedUser)
        loadDashboard(parsedUser.id)
    }, [])

    async function loadDashboard(userId: string) {
        try {
            const { data: matchesData } = await supabase
                .from("matches")
                .select("*")

            setTotalMatches(matchesData?.length || 0)

            const { data: predictionsData } = await supabase
                .from("prediction")
                .select("*")
                .eq("user_id", userId)

            setPredictionsCount(predictionsData?.length || 0)

            const { data: scoreData } = await supabase
                .from("scores")
                .select("*")
                .eq("user_id", userId)
                .single()

            setScore(scoreData?.total_score || 0)
        } catch (error) {
            navigate("/error?error-id=E-500")
        }

        try {
            const { data, error } = await supabase.rpc(
                "load_leaderboard"
            )
            if (error) {
                throw error
            }

            const formattedLeaderboard =
                data?.map((item: any) => ({
                    username: item.username,
                    points: item.total_score,
                })) || []

            setLeaderboard(formattedLeaderboard)
            setPrizePool((data.length - 1) * 10000)
        } catch (error) {
            navigate("/error?error-id=E-500")
        }
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white px-4 py-8">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-3xl p-8 shadow-2xl">
                        <p className="text-sm uppercase tracking-widest text-emerald-100 mb-2">
                            Mundial 2026 ⚽
                        </p>

                        <h1 className="text-4xl font-black mb-3">
                            Hola {user?.username}
                        </h1>

                        <p className="text-emerald-100 text-lg">
                            Qué bueno tenerte de vuelta.
                        </p>

                        <div className="grid grid-cols-2 gap-4 mt-8">
                            <div className="bg-white/10 rounded-2xl p-5 backdrop-blur-sm">
                                <p className="text-sm text-emerald-100">
                                    Puntaje actual
                                </p>

                                <p className="text-4xl font-black mt-2">
                                    {score}
                                </p>
                            </div>

                            <div className="bg-white/10 rounded-2xl p-5 backdrop-blur-sm">
                                <p className="text-sm text-emerald-100">
                                    Predicciones
                                </p>

                                <p className="text-4xl font-black mt-2">
                                    {predictionsCount}/{totalMatches}
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-around">
                            <button
                                onClick={() => navigate("/predictions")}
                                className="mt-8 bg-white text-emerald-700 font-bold px-6 py-4 rounded-2xl hover:scale-105 transition-transform cursor-pointer"
                            >
                                Ir a Predicciones
                            </button>
                            <button
                                className="mt-8 bg-emerald-400 hover:bg-emerald-300 font-bold px-6 py-4 rounded-2xl hover:scale-105 transition-transform cursor-pointer"
                                onClick={() => { navigate("/") }}
                            >
                                Salir
                            </button>
                        </div>
                    </div>


                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-h-[400px] overflow-y-scroll">

                        <h2 className="text-2xl font-black mb-6">
                            Leaderboard 🏆
                        </h2>

                        <div className="space-y-4">
                            {leaderboard.map((player, index) => (
                                <div
                                    key={player.username}
                                    className="flex items-center justify-between bg-zinc-800 rounded-2xl px-4 py-3"
                                >

                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center font-black">
                                            {index + 1}
                                        </div>

                                        <div>
                                            <p className="font-bold">
                                                {player.username}
                                            </p>
                                        </div>
                                    </div>

                                    <p className="font-black text-xl">
                                        {player.points}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* <div className="bg-slate-800 border border-zinc-800 rounded-2xl p-6 mt-6">

                    <h2 className="text-xl font-bold mb-4">
                        Datos Curiosos 💡
                    </h2>

                    <div className="space-y-3">

                        {
                            funFacts.map((item, index) => (
                                <div
                                    key={index}
                                    className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4"
                                >
                                    <p className="text-zinc-200 leading-relaxed">
                                        {item.fact}
                                    </p>
                                </div>
                            ))
                        }

                    </div>

                </div> */}


                <div className="mt-6 bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
                    <h2 className="text-3xl font-black mb-6">
                        Reglas 📜
                    </h2>

                    <div className="grid md:grid-cols-3 gap-4">

                        <div className=" bg-zinc-800 rounded-2xl p-5">
                            <h3 className="font-bold text-lg mb-2">
                                Resultado correcto
                            </h3>

                            <p className="text-zinc-400">
                                Si aciertas el ganador o aciertas al empate:
                                +1 punto.
                            </p>
                        </div>

                        <div className="bg-zinc-800 rounded-2xl p-5">
                            <h3 className="font-bold text-lg mb-2">
                                Marcador exacto
                            </h3>

                            <p className="text-zinc-400">
                                Si aciertas el marcador exacto:
                                +1 punto adicional.
                            </p>
                        </div>

                        <div className="bg-zinc-800 rounded-2xl p-5">
                            <h3 className="font-bold text-lg mb-2">
                                Ganadores
                            </h3>

                            <p className="text-zinc-400">
                                El pool final se reparte entre
                                los mejores puntajes.
                            </p>
                        </div>


                        <div className="bg-zinc-800 rounded-2xl p-5">
                            <h3 className="font-bold text-lg mb-2">
                                Primer Puesto 🥇
                            </h3>

                            <p className="text-zinc-400">
                                Gana 40% del pool.
                                Acomulado: {Math.floor(prizePool * 0.4)} COP
                            </p>
                        </div>
                        <div className="bg-zinc-800 rounded-2xl p-5">
                            <h3 className="font-bold text-lg mb-2">
                                Segundo Puesto 🥈
                            </h3>

                            <p className="text-zinc-400">
                                Gana 20% del pool.
                                Acomulado: {Math.floor(prizePool * 0.2)} COP
                            </p>
                        </div>
                        <div className="bg-zinc-800 rounded-2xl p-5">
                            <h3 className="font-bold text-lg mb-2">
                                Tercer Puesto 🥉
                            </h3>

                            <p className="text-zinc-400">
                                Gana 10% del pool.
                                Acomulado: {Math.floor(prizePool * 0.1)} COP
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home