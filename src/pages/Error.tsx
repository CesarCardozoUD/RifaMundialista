import { useNavigate, useSearchParams } from "react-router-dom"

function Error() {
    const [searchParams] = useSearchParams()
    const errorID = searchParams.get("error-id")
    const navigate = useNavigate()

    var errorPrompt = ''

    function mapErrorId() {
        switch (errorID) {
            case 'E-404':
                errorPrompt = 'Página No Encontrada.'
                break;
            case 'E-500':
                errorPrompt = 'Oops! Algo Sucedio, intenta nuevamente.'
                break;
            case 'E-001':
                errorPrompt = 'Algo Sucedio Mientras Procesabamos tus Datos. Intenta más Tarde'
                break;
            default:
                errorPrompt = 'Página No Encontrada'
                break;
        }
    }

    mapErrorId()

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-900 text-white">
            <div className="text-center">
                <h1 className="text-6xl font-bold mb-4">
                    {(errorID === '' || errorID == null) ? 'E-404' : errorID}
                </h1>

                <p className="text-zinc-400">
                    {errorPrompt}
                </p>
            </div>
        </div>
    )
}

export default Error