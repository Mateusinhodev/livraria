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

const ROTULOS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

// Cores fixas: atributos SVG não entendem var(--...) em todos os navegadores
const COR_BARRA = '#DC5F00';
const COR_TEXTO_SUAVE = '#666666';
const COR_GRADE = '#EEEEEE';

function GraficoMeses({ porMes, ano }) {
    // O Recharts quer uma lista de objetos: um por mês
    const dados = porMes.map((quantidade, i) => ({
        mes: ROTULOS[i],
        nome: new Date(ano, i, 1).toLocaleDateString('pt-BR', { month: 'long' }),
        quantidade,
    }));

    return (
        <figure className="grafico-meses">
            <figcaption>Livros terminados por mês</figcaption>

            <ResponsiveContainer width="100%" height={240}>
                <BarChart data={dados} margin={{ top: 24, right: 8, bottom: 0, left: -20 }}>
                    <CartesianGrid vertical={false} stroke={COR_GRADE} />

                    <XAxis
                        dataKey="mes"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: COR_TEXTO_SUAVE, fontSize: 13 }}
                    />

                    <YAxis
                        allowDecimals={false}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: COR_TEXTO_SUAVE, fontSize: 13 }}
                    />

                    <Tooltip
                        cursor={{ fill: '#FDEFE3' }}
                        labelFormatter={(_, itens) => itens?.[0]?.payload.nome ?? ''}
                        formatter={(valor) => [valor, valor === 1 ? 'livro' : 'livros']}
                        separator=" "
                    />

                    <Bar dataKey="quantidade" fill={COR_BARRA} radius={[4, 4, 0, 0]} maxBarSize={32}>
                        <LabelList
                            dataKey="quantidade"
                            position="top"
                            formatter={(valor) => (valor > 0 ? valor : '')}
                            style={{ fill: '#222', fontWeight: 700, fontSize: 13 }}
                        />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </figure>
    );
}

export default GraficoMeses;