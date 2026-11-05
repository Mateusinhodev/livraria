import {
    Bar,
    BarChart,
    CartesianGrid,
    LabelList,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

import './grafico-meses.css';

const ROTULOS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

// Cores fixas (atributos SVG não entendem var(--...) em todos os navegadores).
// Mantidas iguais aos tokens do index.css.
const COR_BARRA = '#C2410C'; // --laranja-700
const COR_TEXTO = '#1C1917'; // --cinza-900
const COR_TEXTO_FRACO = '#78716C'; // --cinza-500
const COR_GRADE = '#E7E5E4'; // --cinza-200
const COR_CURSOR = '#FFF7ED'; // --laranja-50

function GraficoMeses({ porMes, ano }) {
    const dados = porMes.map((quantidade, i) => ({
        mes: ROTULOS[i],
        nome: new Date(ano, i, 1).toLocaleDateString('pt-BR', { month: 'long' }),
        quantidade,
    }));

    return (
        <figure className="cartao grafico-meses">
            <figcaption className="rotulo">Livros terminados por mês</figcaption>

            <ResponsiveContainer width="100%" height={240}>
                <BarChart data={dados} margin={{ top: 24, right: 8, bottom: 0, left: -20 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="mes" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />

                    <Tooltip
                        labelFormatter={(_, itens) => itens?.[0]?.payload.nome ?? ''}
                        formatter={(valor) => [valor, valor === 1 ? 'livro' : 'livros']}
                        separator=" "
                    />

                    <Bar dataKey="quantidade" radius={[4, 4, 0, 0]} maxBarSize={32}>
                        <LabelList
                            dataKey="quantidade"
                            position="top"
                            formatter={(valor) => (valor > 0 ? valor : '')}
                        />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </figure>
    );
}

export default GraficoMeses;