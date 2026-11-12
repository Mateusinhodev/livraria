// A "forma" da grade de livros enquanto os dados não chegam.
// Usa as mesmas classes de grade do CardLivro, então ocupa o mesmo espaço.
function GradeEsqueleto({ quantidade = 10 }) {
    return (
        <ul className="grade-livros" aria-hidden="true">
            {Array.from({ length: quantidade }, (_, indice) => (
                <li key={indice} className="card-esqueleto">
                    <div className="esqueleto card-esqueleto__capa" />
                    <div className="esqueleto card-esqueleto__linha" />
                    <div className="esqueleto card-esqueleto__linha card-esqueleto__linha--curta" />
                </li>
            ))}
        </ul>
    );
}

export default GradeEsqueleto;