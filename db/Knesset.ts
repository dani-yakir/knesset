

interface Knesset {
    id: number,
    name: string,
    start: string,
    end?: string
}


export function createKnessetFromCmb(cmbKnesset: any): Knesset {
    return {
        id: cmbKnesset.KnessetId,
        name: cmbKnesset.KnessetName,
        start: cmbKnesset.KnessetStart,
        end: cmbKnesset.KnessetEnd
        
    }
}
