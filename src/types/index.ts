export interface ProiezioniFilmDto {
    id: number
    data: string
    ora: string
    stato: string
    nomeSala: string
}

export interface BasicFilmInfoDto {
    id: number
    titolo: string
    genere: string
    locandina: string
    proiezioni: ProiezioniFilmDto[]
}

export interface FestivalDetailsDto {
    id: number
    nome: string
    anno: number
    citta: string
    dataInizio: string
    dataFine: string
    descrizione: string
    film: BasicFilmInfoDto[]
}