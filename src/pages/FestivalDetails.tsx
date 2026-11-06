import {useEffect, useMemo, useState} from "react"
import {useParams} from "react-router-dom"
import type {FestivalDetailsDto, BasicFilmInfoDto, ProiezioniFilmDto} from "../types"
import {getFestival} from "../services/festivalService"
import "./FestivalDetails.css"

const SPRING_ORIGIN = "http://localhost:8080"
type Tab = "programmazione" | "film"

function dateList(from: string, to: string): string[] {
    const start = new Date(`${from}T00:00:00Z`)
    const end = new Date(`${to}T00:00:00Z`)
    if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime())) return []
    const dates: string[] = []
    while (start <= end && dates.length < 370) {
        dates.push(start.toISOString().slice(0, 10))
        start.setUTCDate(start.getUTCDate() + 1)
    }
    return dates
}

function printDate(value: string, option: "short" | "long" = "long"): string {
    return new Intl.DateTimeFormat("it-IT", option === "short"
        ? {weekday: "short", day: "numeric", month: "short", timeZone: "UTC"}
        : {day: "numeric", month: "long", year: "numeric", timeZone: "UTC"}
    ).format(new Date(`${value}T00:00:00Z`))
}

function posterUrl(locandina: string | null | undefined): string | null {
    if (!locandina) return null
    if (locandina.startsWith("http://") || locandina.startsWith("https://")) return locandina
    return `${SPRING_ORIGIN}${locandina.startsWith("/") ? "" : "/"}${locandina}`
}

function Poster({film}: { film: BasicFilmInfoDto }) {
    const [failed, setFailed] = useState(false)
    const poster = posterUrl(film.locandina)
    return <div className="mv-poster">{poster && !failed
        ? <img src={poster} alt={`Locandina di ${film.titolo}`} onError={() => setFailed(true)}/>
        : <span className="mv-poster-placeholder">{film.titolo}</span>}</div>
}

function FilmCard({film}: { film: BasicFilmInfoDto }) {
    return <article className="mv-film-card">
        <a href={`${SPRING_ORIGIN}/films/${film.id}`}><Poster film={film}/></a>
        <div className="mv-film-meta">
            <h3><a href={`${SPRING_ORIGIN}/films/${film.id}`}>{film.titolo}</a></h3>
            <p>{film.genere || "Film"} · {film.proiezioni.length} {film.proiezioni.length === 1 ? "proiezione" : "proiezioni"}</p>
        </div>
    </article>
}

function FestivalDetails() {
    const {id} = useParams()
    const [festival, setFestival] = useState<FestivalDetailsDto | null>(null)
    const [error, setError] = useState("")
    const [tab, setTab] = useState<Tab>("programmazione")
    const [day, setDay] = useState<string | null>(null)
    const [search, setSearch] = useState("")

    useEffect(() => {
        let active = true
        setFestival(null)
        setError("")
        setDay(null)

        if (!id || Number.isNaN(Number(id))) {
            setError("Festival non valido.")
            return
        }

        getFestival(Number(id)).then(data => {
            if (active) {
                setFestival(data)
                document.title = `${data.nome} · Moviola`
            }
        }).catch(() => {
            if (active) setError("Impossibile caricare il festival. Verifica che Spring Boot sia avviato.")
        })

        return () => {
            active = false
        }
    }, [id])

    const days = useMemo(() => festival ? dateList(festival.dataInizio, festival.dataFine) : [], [festival])
    const currentDay = day && days.includes(day) ? day : days[0]

    const screenings = useMemo(() => {
        if (!festival) return []
        return festival.film.flatMap(film => film.proiezioni
            .filter(screening => screening.data === currentDay)
            .map(screening => ({film, screening})))
            .sort((a, b) => a.screening.ora.localeCompare(b.screening.ora))
    }, [festival, currentDay])

    const movieResults = useMemo(() => festival?.film.filter(film =>
        `${film.titolo} ${film.genere}`.toLocaleLowerCase("it").includes(search.toLocaleLowerCase("it").trim())) ?? [], [festival, search])

    return <div className="mv-layout">
        <div className="mv-workspace">
            <header className="mv-topbar">
                <a className="mv-back-button" href={`${SPRING_ORIGIN}/festivals`}>← Torna ai festival</a>
                <span>MOVIOLA &nbsp; / &nbsp; <b>Festival / Dettaglio</b></span>
                <div><a href={`${SPRING_ORIGIN}/films`}>Esplora i film &nbsp; ↗</a></div>
            </header>

            <main className="mv-main">
                {error ?
                    <section className="mv-empty">
                        <h2>{error}</h2>
                        <a href={`${SPRING_ORIGIN}/festivals`}>Torna ai festival</a>
                    </section>
                    : !festival ?
                        <div className="mv-empty">Caricamento festival…</div>
                        : <>
                            <section className="mv-hero">
                                <div className="mv-hero-content">
                                    <p className="mv-eyebrow">Festival cinematografico / {festival.anno}</p>
                                    <h1>{festival.nome}</h1>
                                    <p>{festival.descrizione}</p>
                                    <div className="mv-hero-tags">
                                        <span>⌖ &nbsp; {festival.citta}</span>
                                        <span>▦ &nbsp; {printDate(festival.dataInizio)} — {printDate(festival.dataFine)}</span>
                                    </div>
                                </div>
                                <div className="mv-hero-picture">
                                    <img src={`${SPRING_ORIGIN}/images/moviola-editoriale/hero-theater.webp`} alt="Sala cinematografica, immagine illustrativa"/>
                                    <span>FESTIVAL CINEMATOGRAFICO · MOVIOLA</span>
                                </div>
                            </section>

                            <section className="mv-overview">
                                <div>
                                    <span className="mv-eyebrow">L'edizione</span>
                                    <h2>Il cinema incontra<br/><em>la sua città.</em></h2>
                                </div>
                                <div className="mv-overview-stats">
                                    <div><b>{festival.film.length}</b><span>Film partecipanti</span></div>
                                    <div><b>{festival.film.reduce((a, f) => a + f.proiezioni.length, 0)}</b><span>Proiezioni</span></div>
                                    <div><b>{days.length}</b><span>Giorni</span></div>
                                </div>
                            </section>

                            <div className="mv-tabs" role="tablist" aria-label="Sezioni del festival">
                                <button type="button" role="tab" aria-selected={tab === "programmazione"}
                                        className={tab === "programmazione" ? "active" : ""}
                                        onClick={() => setTab("programmazione")}>Programmazione</button>
                                <button type="button" role="tab" aria-selected={tab === "film"}
                                        className={tab === "film" ? "active" : ""}
                                        onClick={() => setTab("film")}>Film partecipanti <span>{festival.film.length}</span></button>
                            </div>

                            {tab === "programmazione" ?
                                <section aria-label="Programmazione">
                                    <div className="mv-section-heading">
                                        <div>
                                            <p className="mv-eyebrow">Sul grande schermo</p>
                                            <h2>Il programma.</h2>
                                        </div>
                                        <span>Seleziona un giorno per vedere le proiezioni</span>
                                    </div>

                                    <div className="mv-days">
                                        {days.map(value => <button type="button" key={value}
                                                                   className={value === currentDay ? "selected" : ""}
                                                                   onClick={() => setDay(value)}>{printDate(value, "short")}</button>)}
                                    </div>

                                    <h3 className="mv-day-head">
                                        {currentDay ? printDate(currentDay) : "Calendario"}
                                        <span>{screenings.length} {screenings.length === 1 ? "proiezione" : "proiezioni"}</span>
                                    </h3>

                                    {screenings.length === 0 ?
                                        <div className="mv-empty">Nessuna proiezione programmata per questo giorno.</div>
                                        : <div className="mv-screenings">
                                            {screenings.map(({film, screening}: {film: BasicFilmInfoDto, screening: ProiezioniFilmDto}) =>
                                                    <article className="mv-screening" key={screening.id}>
                                                        <time>{screening.ora.slice(0, 5)}</time>
                                                        <a className="mv-screening-poster" href={`${SPRING_ORIGIN}/films/${film.id}`}><Poster film={film}/></a>
                                                        <div className="mv-screening-copy">
                                                            <span className="mv-eyebrow">{film.genere || "Film"}</span>
                                                            <h3><a href={`${SPRING_ORIGIN}/films/${film.id}`}>{film.titolo}</a></h3>
                                                            <p>Sala · {screening.nomeSala || "Da definire"}</p>
                                                        </div>
                                                        <span className={`mv-status ${screening.stato === "CANCELLED" ? "cancelled" : ""}`}>
                                            {screening.stato === "CANCELLED" ? "Annullata" : screening.stato === "COMPLETED" ? "Completata" : "Programmata"}
                                        </span>
                                                        <a href={`${SPRING_ORIGIN}/films/${film.id}`} className="mv-screening-link" aria-label={`Dettagli di ${film.titolo}`}>↗</a>
                                                    </article>
                                            )}
                                        </div>}
                                </section>
                                : <section aria-label="Film partecipanti">
                                    <div className="mv-section-heading">
                                        <div>
                                            <p className="mv-eyebrow">La selezione ufficiale</p>
                                            <h2>Tutti i film.</h2>
                                        </div>
                                        <input aria-label="Cerca nei film del festival" className="mv-search"
                                               value={search} onChange={event => setSearch(event.target.value)}
                                               placeholder="Cerca un film…"/>
                                    </div>
                                    <p className="mv-note">Sono mostrati anche i film associati al festival che non hanno ancora proiezioni.</p>
                                    <div className="mv-film-grid">
                                        {movieResults.map(film => <FilmCard key={film.id} film={film}/>)}
                                    </div>
                                    {movieResults.length === 0 && <div className="mv-empty">Nessun film trovato.</div>}
                                </section>}
                        </>}
                <footer className="mv-footer">© Moviola · Ogni storia merita di essere vista.</footer>
            </main>
        </div>
    </div>
}

export default FestivalDetails