import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import type { FestivalDetailsDto } from "../types"
import { getFestival } from "../services/festivalService"
import "./FestivalDetails.css"


function generaGiorni(dataInizio: string, dataFine: string): string[] {

    const giorni: string[] = []

    const dataCorrente =
        new Date(`${dataInizio}T00:00:00Z`)

    const ultimaData =
        new Date(`${dataFine}T00:00:00Z`)

    while (dataCorrente <= ultimaData) {

        giorni.push(
            dataCorrente.toISOString().substring(0, 10)
        )

        dataCorrente.setUTCDate(
            dataCorrente.getUTCDate() + 1
        )
    }

    return giorni
}


function formattaGiorno(data: string): string {

    return new Intl.DateTimeFormat(
        "it-IT",
        {
            weekday: "short",
            day: "numeric",
            month: "short",
            timeZone: "UTC"
        }
    ).format(
        new Date(`${data}T00:00:00Z`)
    )
}


function formattaData(data: string): string {

    return new Intl.DateTimeFormat(
        "it-IT",
        {
            day: "numeric",
            month: "long",
            year: "numeric",
            timeZone: "UTC"
        }
    ).format(
        new Date(`${data}T00:00:00Z`)
    )
}


function formattaOra(ora: string): string {
    return ora.substring(0, 5)
}


function FestivalDetails() {

    const { id } = useParams()

    const [festival, setFestival] =
        useState<FestivalDetailsDto | null>(null)

    const [giornoSelezionato, setGiornoSelezionato] =
        useState<string | null>(null)


    useEffect(() => {

        async function caricaFestival() {

            if (!id) {
                return
            }

            const dati =
                await getFestival(Number(id))

            setFestival(dati)
        }

        caricaFestival()

    }, [id])


    if (festival === null) {
        return <p>Caricamento...</p>
    }


    const giorni =
        generaGiorni(
            festival.dataInizio,
            festival.dataFine
        )


    const giornoCorrente =
        giornoSelezionato ?? giorni[0]


    const durata =
        giorni.length


    const filmDelGiorno =
        festival.film.filter(film =>
            film.proiezioni.some(
                proiezione =>
                    proiezione.data === giornoCorrente
            )
        )


    return (

        <main className="festival-page">

            <section className="festival-header">

                <a
                    className="torna-festival"
                    href="http://localhost:8080/festivals"
                >
                    ← Torna ai festival
                </a>


                <h1>
                    {festival.nome}
                </h1>


                <p className="festival-description">
                    {festival.descrizione}
                </p>


                <div className="festival-info">

                    <div className="festival-info-item">
                        <span className="info-label">
                            Città
                        </span>

                        <span>
                            {festival.citta}
                        </span>
                    </div>


                    <div className="festival-info-item">
                        <span className="info-label">
                            Date
                        </span>

                        <span>
                            Dal {formattaData(festival.dataInizio)}
                            {" "}al{" "}
                            {formattaData(festival.dataFine)}
                        </span>
                    </div>


                    <div className="festival-info-item">
                        <span className="info-label">
                            Durata
                        </span>

                        <span>
                            {durata} giorni
                        </span>
                    </div>

                </div>

            </section>


            <section className="programmazione">

                <div className="programmazione-header">

                    <h2>
                        Programmazione
                    </h2>


                    <div className="giorni">

                        {giorni.map(giorno => (

                            <button
                                key={giorno}
                                className={
                                    giorno === giornoCorrente
                                        ? "giorno attivo"
                                        : "giorno"
                                }
                                onClick={() =>
                                    setGiornoSelezionato(giorno)
                                }
                            >
                                {formattaGiorno(giorno)}
                            </button>

                        ))}

                    </div>

                </div>


                <p className="giorno-selezionato">
                    Programmazione di{" "}
                    <strong>
                        {formattaData(giornoCorrente)}
                    </strong>
                </p>


                {filmDelGiorno.length === 0 ? (

                    <div className="nessuna-proiezione">
                        Nessuna proiezione prevista
                        per questa giornata.
                    </div>

                ) : (

                    filmDelGiorno.map(film => {

                        const proiezioniDelGiorno =
                            film.proiezioni.filter(
                                proiezione =>
                                    proiezione.data === giornoCorrente
                            )


                        const proiezioniPerSala =
                            proiezioniDelGiorno.reduce<
                                Record<
                                    string,
                                    typeof proiezioniDelGiorno
                                >
                            >(
                                (sale, proiezione) => {

                                    if (!sale[proiezione.nomeSala]) {
                                        sale[proiezione.nomeSala] = []
                                    }

                                    sale[proiezione.nomeSala].push(
                                        proiezione
                                    )

                                    return sale
                                },
                                {}
                            )


                        return (

                            <article
                                className="film-card"
                                key={film.id}
                            >

                                <a
                                    className="poster-link"
                                    href={
                                        `http://localhost:8080/films/${film.id}`
                                    }
                                >
                                    <img
                                        className="film-poster"
                                        src={
                                            `http://localhost:8080${film.locandina}`
                                        }
                                        alt={film.titolo}
                                    />
                                </a>


                                <div className="film-content">

                                    <a
                                        className="film-title"
                                        href={
                                            `http://localhost:8080/films/${film.id}`
                                        }
                                    >
                                        <h3>
                                            {film.titolo}
                                        </h3>
                                    </a>


                                    <p className="film-genere">
                                        Genere: {film.genere}
                                    </p>


                                    <a
                                        className="dettagli-film"
                                        href={
                                            `http://localhost:8080/films/${film.id}`
                                        }
                                    >
                                        Vai ai dettagli
                                    </a>


                                    <div className="sale-container">

                                        {Object.entries(
                                            proiezioniPerSala
                                        ).map(
                                            ([nomeSala, proiezioni]) => (

                                                <div
                                                    className="sala-row"
                                                    key={nomeSala}
                                                >

                                                    <div className="sala-column">

                                                        <span className="sala-label">
                                                            Sala
                                                        </span>

                                                        <span className="sala-value">
                                                            {nomeSala}
                                                        </span>

                                                    </div>


                                                    <div className="orari-column">

                                                        <span className="sala-label">
                                                            Orario
                                                        </span>

                                                        <div className="orari">

                                                            {proiezioni.map(
                                                                proiezione => (

                                                                    <span
                                                                        className="orario"
                                                                        key={
                                                                            proiezione.id
                                                                        }
                                                                    >
                                                                        {
                                                                            formattaOra(
                                                                                proiezione.ora
                                                                            )
                                                                        }
                                                                    </span>

                                                                )
                                                            )}

                                                        </div>

                                                    </div>

                                                </div>

                                            )
                                        )}

                                    </div>

                                </div>

                            </article>

                        )
                    })

                )}

            </section>

        </main>
    )
}


export default FestivalDetails