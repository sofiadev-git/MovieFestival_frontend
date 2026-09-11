import api from "./api"
import type { FestivalDetailsDto } from "../types"

export async function getFestival(
    id: number
): Promise<FestivalDetailsDto> {

    const { data } =
        await api.get<FestivalDetailsDto>(`/festivals/${id}`)

    return data
}