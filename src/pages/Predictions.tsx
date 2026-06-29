import { useEffect, useMemo, useState } from "react"
import { supabase } from "../utils/supabase"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { all_dates, all_groups, all_teams, match_status, months, stage_dict } from "../utils/enums"

interface Match {
    id: string
    team_a: string,
    team_b: string,
    match_date: Date,
    state: string,
    team_a_score?: string | null,
    team_b_score?: string | null,
    group_id: string,
    multiplier: number,
    stage: string
}

interface Prediction {
    matchId: string
    team_a_score?: number
    team_b_score?: number
}

interface Results {
    matchId: string,
    real_final: string,
    points: number
}

function Predictions() {
    const navigate = useNavigate()

    const [predictions, setPredictions] = useState<Prediction[]>([])
    const [results, setResults] = useState<Results[]>([])
    const [allMatches, setAllMatches] = useState<Match[]>([])
    const [bkMatches, setBkMatches] = useState<Match[]>([])
    const [filteredMatches, setFilteredMatches] = useState<Match[]>([])
    const [page, setPage] = useState(0);
    const [maxPage, setMaxPage] = useState(7);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        async function loadMatches() {
            try {
                const localUser = JSON.parse(
                    localStorage.getItem("user") || "{}"
                )

                if (!localUser.id) {
                    throw new Error()
                }

                const { data: matchesData } = await supabase
                    .from("matches")
                    .select("*")
                    .order("match_date", { ascending: true })

                if (!matchesData || matchesData.length <= 0) {
                    throw new Error()
                } else {
                    const formattedMatches = matchesData?.map((item: any) => ({
                        id: item.id,
                        team_a: item.team_a,
                        team_b: item.team_b,
                        match_date: new Date(item.match_date),
                        state: item.state,
                        team_a_score: item.team_a_score,
                        team_b_score: item.team_b_score,
                        group_id: item.group_id,
                        multiplier: item.multiplier,
                        stage: item.stage
                    })) || []

                    setAllMatches(formattedMatches)
                    setBkMatches(formattedMatches)
                }

                const { data: predictionsData } =
                    await supabase
                        .from("prediction")
                        .select("*")
                        .eq("user_id", localUser.id)

                if (!predictionsData) {
                    throw new Error()
                } else {
                    const formattedPredictions =
                        predictionsData?.map((item: any) => ({
                            matchId: item.match_id,
                            team_a_score: item.team_a_score,
                            team_b_score: item.team_b_score
                        })) || []

                    setPredictions(formattedPredictions)
                }

                const { data: resultsByUser } =
                    await supabase
                        .from("prediction_result")
                        .select("match_id, real_final, earned_points")
                        .eq("user_id", localUser.id)

                if (!resultsByUser) {
                    setResults([])
                } else {
                    const formattedResults =
                        resultsByUser?.map((item: any) => ({
                            matchId: item.match_id,
                            real_final: item.real_final,
                            points: item.earned_points
                        }))

                    setResults(formattedResults)
                }

            } catch (error) {
                navigate("/error?error-id=E-500")
            }
        }

        loadMatches()
    }, [])

    useEffect(() => {
        const newSlice = allMatches.slice((page * 10), (page + 1) * 10);
        setFilteredMatches(newSlice);
    }, [allMatches, page])

    function handleSelectFilter(filterType: string, filterValue: string) {
        let filteredMatches = []
        switch (filterType) {
            case 'TEAMS':
                filteredMatches = bkMatches.filter((item) => (item.team_a === filterValue) || (item.team_b === filterValue))
                setMaxPage(Math.ceil(filteredMatches.length / 10) - 1)
                setPage(0)
                setAllMatches(filteredMatches)
                break;
            case 'GROUPS':
                filteredMatches = bkMatches.filter((item) => (item.group_id === filterValue))
                setMaxPage(Math.ceil(filteredMatches.length / 10) - 1)
                setPage(0)
                setAllMatches(filteredMatches)
                break;
            case 'DATES':
                filteredMatches = bkMatches.filter((item) => (
                    (item.match_date.getDate().toString() === filterValue.split(' ')[0]) &&
                    (months[item.match_date.getMonth().toString()] === filterValue.split(' ')[1])
                ))
                setMaxPage(Math.ceil(filteredMatches.length / 10) - 1)
                setPage(0)
                setAllMatches(filteredMatches)
                break;
            case 'CLEAN':
                filteredMatches = bkMatches
                setMaxPage(Math.ceil(filteredMatches.length / 10) - 1)
                setPage(0)
                setAllMatches(filteredMatches)
                break;
            default:
                break;
        }
    }

    function changePage(isNext: boolean) {
        if (isNext && page < maxPage) {
            setPage(page + 1);
        } else if (!isNext && page > 0) {
            setPage(page - 1);
        }
    }

    function updatePrediction(
        matchId: string,
        side: "team_a_score" | "team_b_score",
        value: string
    ) {
        const parsedValue = value === "" ? undefined : Number(value)

        setPredictions((previous) => {
            const existingPrediction = previous.find(
                (prediction) => prediction.matchId === matchId
            )

            if (!existingPrediction) {
                return [
                    ...previous,
                    {
                        matchId,
                        team_a_score: side === "team_a_score" ? parsedValue : undefined,
                        team_b_score: side === "team_b_score" ? parsedValue : undefined,
                    },
                ]
            }

            return previous.map((prediction) => {
                if (prediction.matchId !== matchId) {
                    return prediction
                }

                return {
                    ...prediction,
                    [side]: value === "" ? undefined : Number(value)
                }
            })
        })
    }

    const totalPredictions = useMemo(() => {
        return predictions.length
    }, [predictions])

    function formatCountryName(
        name: string
    ) {

        return name
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, "-")
    }

    function getPrediction(matchId: string) {
        return predictions.find((prediction) => prediction.matchId === matchId)
    }

    function getTimeRemaining(matchDate: Date) {
        const now = new Date()
        const difference = matchDate.getTime() - now.getTime()
        const totalHours = Math.floor(
            difference / (1000 * 60 * 60)
        )
        if (totalHours <= -2) {
            return match_status.end
        } else if (totalHours <= 0) {
            return match_status.going
        }
        const days = Math.floor(totalHours / 24)
        const hours = totalHours % 24
        return `${match_status.pending} ${days}d ${hours}h`
    }

    function buildRealMark(match: Match) {
        const final_result = results.find((x) => (x.matchId == match.id))

        if (final_result) {
            const mini_flag_local = <img src={`./flags/${formatCountryName(match.team_a)}.png`}
                className="w-4 h-4 rounded-full object-cover border border-zinc-700"></img>
            const mini_flag_visit = <img src={`./flags/${formatCountryName(match.team_b)}.png`}
                className="w-4 h-4 rounded-full object-cover border border-zinc-700"></img>

            const final_score = final_result.real_final.split('-')
            const score_local = final_score[0].split(':')[1]
            const score_visit = final_score[1].split(':')[1]

            return (
                <div className="flex items-center gap-3 bg-zinc-800/50 rounded-lg px-3 py-2 border border-zinc-700">
                    <div className="flex items-center gap-2">
                        {mini_flag_local}
                        <span className="font-semibold text-zinc-100">
                            {score_local}
                        </span>
                        <span className="text-zinc-400">
                            -
                        </span>
                        <span className="font-semibold text-zinc-100">
                            {score_visit}
                        </span>
                        {mini_flag_visit}
                    </div>
                    <div className="h-4 w-px bg-zinc-600" />
                    <span className="text-sm text-blue-400 font-medium">
                        +{final_result.points} pts
                    </span>

                </div>
            )
        }
        return <div className="bg-zinc-800 px-3 py-1 rounded-full text-sm text-zinc-300 font-semibold">
            ⏳ {getTimeRemaining(match.match_date)}
        </div>
    }

    function disableInput(matchDate: Date) {
        const status = getTimeRemaining(matchDate)
        if (status == match_status.end || status == match_status.going) {
            return true;
        }
        return false;
    }

    function setScorePanelBG(stage: string, multiplier: number) {
        switch (stage) {
            case 'GROUPS':
                if (multiplier > 1) {
                    return "bg-gradient-to-br from-amber-800/30 via-amber-400/60 to-amber-200 rounded-2xl p-5 border border-amber-600 shadow-lg shadow-amber-900/50"
                } else {
                    return "bg-zinc-900 rounded-2xl border border-zinc-800 p-5 hover:border-emerald-500 transition-colors"
                }
            case 'ELIM_16':
                return "bg-gradient-to-r from-purple-900/50 via-fuchsia-800/50 to-purple-900/50 rounded-2xl p-5 border-2 border-fuchsia-400 shadow-xl shadow-fuchsia-900/50"
            case 'ELIM_8':
                return "bg-gradient-to-r from-slate-900/75 via-cyan-800/75 to-slate-900/50 rounded-2xl p-5 border-2 border-cyan-300 shadow-xl shadow-cyan-900/40"
            case 'ELIM_4':
                return "bg-gradient-to-r from-emerald-900/50 via-lime-800/50 to-emerald-900/50 rounded-2xl p-5 border border-emerald-500"
            case 'SEMIFINAL':
                return "bg-gradient-to-r from-zinc-900/50 via-slate-300/60 to-zinc-700/50 rounded-2xl p-5 border-2 border-slate-300 shadow-xl shadow-slate-900/40"
            case 'FINAL':
                return "bg-gradient-to-r from-yellow-900/50 via-amber-500/60 to-yellow-800/50 rounded-2xl p-5 border-2 border-yellow-400 shadow-xl shadow-amber-900/50"
        }
    }

    async function handleSavePredictions() {
        setIsLoading(true);

        const user = JSON.parse(
            localStorage.getItem("user") || "{}"
        )

        const validPredictions = predictions.filter(
            (prediction) =>
                prediction.team_a_score !== undefined
                && prediction.team_b_score !== undefined
        )

        const formattedPredictions = validPredictions.map(
            (prediction) => ({
                user_id: user.id,
                match_id: prediction.matchId,
                team_a_score: prediction.team_a_score,
                team_b_score: prediction.team_b_score
            })
        )

        const { error } = await supabase.rpc(
            "save_predictions",
            {
                p_predictions: formattedPredictions
            }
        )

        if (error) {
            navigate("/error?error-id=E-001")
            return
        }

        toast.success("Predicciones guardadas correctamente, ¡Buena Suerte!")
        setIsLoading(false);
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white px-4 py-8">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl text-center font-bold mb-2">
                            Predicciones ⚽
                        </h1>

                        <p className="text-zinc-400">
                            Define los resultados de cada partido.
                        </p>
                    </div>

                    <div>

                        <div className="bg-zinc-900 border border-zinc-800 px-4 py-3 rounded-2xl">
                            <p className="text-sm text-zinc-400">
                                Partidos predichos
                            </p>

                            <p className="text-2xl font-bold">
                                {totalPredictions}
                            </p>

                        </div>
                        <button
                            className="bg-yellow-400 hover:bg-yellow-300 rounded-2xl w-32 px-4 py-3 text-2xl mt-2 cursor-pointer"
                            onClick={() => { navigate("/home") }}
                        >
                            Inicio
                        </button>
                    </div>

                </div>


                <div className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4 mb-6">
                    <p className="text-white font-bold text-lg whitespace-nowrap">FILTROS</p>
                    <select
                        defaultValue=""
                        onChange={(event) => { handleSelectFilter("TEAMS", event.target.value) }}
                        className="flex-1 w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500 transition-colors cursor-pointer"
                    >
                        <option value="">-- Seleccionar Equipo --</option>
                        {
                            all_teams.map((team) => {
                                return (
                                    <option>{team}</option>
                                )
                            })
                        }
                    </select>
                    <select
                        defaultValue=""
                        onChange={(event) => { handleSelectFilter("GROUPS", event.target.value) }}
                        className="flex-1 w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500 transition-colors cursor-pointer"
                    >
                        <option value="">-- Seleccionar Grupo --</option>
                        {
                            all_groups.map((group) => {
                                return (
                                    <option>{group}</option>
                                )
                            })
                        }
                    </select>
                    <select
                        defaultValue=""
                        onChange={(event) => { handleSelectFilter("DATES", event.target.value) }}
                        className="flex-1 w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500 transition-colors cursor-pointer"
                    >
                        <option value="">-- Seleccionar Fecha --</option>
                        {
                            all_dates.map((date) => {
                                return (
                                    <option>{date}</option>
                                )
                            })
                        }
                    </select>
                    <button
                        onClick={() => { handleSelectFilter("CLEAN", "") }}
                        className="bg-red-500 hover:bg-red-400 transition-colors text-white font-bold px-6 py-3 rounded-xl cursor-pointer whitespace-nowrap"
                    >
                        Limpiar Filtros
                    </button>
                </div>

                <div className="space-y-4">
                    {filteredMatches.map((match) => {
                        const prediction = getPrediction(match.id)

                        return (
                            <div
                                key={match.id}
                                className={setScorePanelBG(match.stage, match.multiplier)}
                            >
                                <div className="flex items-center justify-between mb-5">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-sm font-bold">
                                            {match.stage !== 'GROUPS' ? stage_dict[match.stage] : 'Grupo ' + match.group_id}
                                        </div>
                                        {
                                            match.match_date > new Date() ?
                                                <p className="text-zinc-400 text-sm">
                                                    {match.match_date.toLocaleDateString()}
                                                </p> :
                                                <></>
                                        }

                                    </div>
                                    <div>
                                        {
                                            buildRealMark(match)
                                        }
                                    </div>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between py-2">
                                            <img
                                                src={`./flags/${formatCountryName(match.team_a)}.png`}
                                                className="w-12 h-12 rounded-full object-cover border border-zinc-700"
                                            ></img>

                                            <p className="text-lg font-semibold">
                                                {match.team_a}
                                            </p>

                                            {
                                                match.stage === 'GROUPS' ?
                                                    (
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            disabled={disableInput(match.match_date)}
                                                            value={prediction?.team_a_score ?? ""}
                                                            onChange={(event) =>
                                                                updatePrediction(
                                                                    match.id,
                                                                    "team_a_score",
                                                                    event.target.value
                                                                )
                                                            }
                                                            className="w-16 h-14 bg-zinc-800 border border-zinc-700 rounded-xl text-center text-2xl font-bold outline-none focus:border-emerald-500"
                                                        />
                                                    ) : (
                                                        <button
                                                            disabled={disableInput(match.match_date)}
                                                            onClick={() => {
                                                                updatePrediction(match.id, "team_a_score", "100");
                                                                updatePrediction(match.id, "team_b_score", "0");
                                                            }}
                                                            className={`px-4 py-2 rounded-xl border font-semibold transition-colors ${prediction?.team_a_score === 100
                                                                ? "bg-emerald-950 border-emerald-700 w-15 h-15 text-2xl"
                                                                : "bg-red-950 border-red-700 w-10 h-10"
                                                                }`}
                                                        >
                                                            {prediction?.team_a_score === 100 ? '🏆' : ''}
                                                        </button>
                                                    )
                                            }

                                        </div>

                                        <div className="flex items-center justify-between py-2" >
                                            <img
                                                src={`./flags/${formatCountryName(match.team_b)}.png`}
                                                className="w-12 h-12 rounded-full object-cover border border-zinc-700"
                                            ></img>

                                            <p className="text-lg font-semibold">
                                                {match.team_b}
                                            </p>

                                            {
                                                match.stage === 'GROUPS' ?
                                                    (
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            disabled={disableInput(match.match_date)}
                                                            value={prediction?.team_b_score ?? ""}
                                                            onChange={(event) =>
                                                                updatePrediction(
                                                                    match.id,
                                                                    "team_b_score",
                                                                    event.target.value
                                                                )
                                                            }
                                                            className="w-16 h-14 bg-zinc-800 border border-zinc-700 rounded-xl text-center text-2xl font-bold outline-none focus:border-emerald-500"
                                                        />
                                                    ) : (
                                                        <button
                                                            disabled={disableInput(match.match_date)}
                                                            onClick={() => {
                                                                updatePrediction(match.id, "team_a_score", "0");
                                                                updatePrediction(match.id, "team_b_score", "100");
                                                            }}
                                                            className={`px-4 py-2 rounded-xl border font-semibold transition-colors ${prediction?.team_b_score === 100
                                                                ? "bg-emerald-950 border-emerald-700 w-15 h-15 text-2xl"
                                                                : "bg-red-950 border-red-700 w-10 h-10"
                                                                }`}
                                                        >
                                                            {prediction?.team_b_score === 100 ? '🏆' : ''}
                                                        </button>
                                                    )
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                <div className="flex gap-4 mt-8">

                    <button
                        className="w-14 bg-zinc-800 hover:bg-zinc-700 transition-colors text-white font-bold py-4 rounded-2xl cursor-pointer"
                        onClick={() => changePage(false)}
                    >
                        {'<'}
                    </button>

                    <button
                        onClick={handleSavePredictions}
                        className="flex-1 bg-emerald-500 hover:bg-emerald-400 transition-colors text-white font-bold py-4 rounded-2xl cursor-pointer"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Guardando ...' : 'Guardar predicciones'}
                    </button>

                    <button
                        className="w-14 bg-zinc-800 hover:bg-zinc-700 transition-colors text-white font-bold py-4 rounded-2xl cursor-pointer"
                        onClick={() => changePage(true)}
                    >
                        {'>'}
                    </button>

                </div>
            </div>
        </div>
    )
}

export default Predictions