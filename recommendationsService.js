const linearAlgebra = require('linear-algebra')();
const Matrix = linearAlgebra.Matrix;
const SVD = require('svd-js').SVD;
const Decimal = require('decimal.js');

const RECOMMENDATIONS_LIMIT = 15;

module.exports = {
    makeMatrixFromRatings: (ratesData, numberOfUsers, numberOfSongs) => {
        let ratesMatrix = Matrix.zero(numberOfUsers, numberOfSongs);
        Array.from(ratesData).forEach(row => {
            ratesMatrix.data[row.userId - 1][row.songId - 1] = row.songRate;
        });
        return ratesMatrix.data;
    },
    recommendBySimilarity: (ratesData, id) => {
        id = id - 1
        const similarities = calculateVectorsSimilarity(ratesData, id)
        if(!similarities.length){
            return []
        }
        const predictedValues = makePredictedValuesMatrix(ratesData, similarities)
        const ranking = []
        for(let column = 0; column < ratesData[id].length; column++) {
            if(ratesData[id][column] === 0) {
                let max = 0
                predictedValues.forEach((row, index) => {
                    if(index !== id) {
                        if(row[column] > max) {
                            max = row[column]
                        }
                    }
                })
                ranking.push({ id: column + 1, rate: max })
            }
        }

        const recommendations = ranking.sort((a, b) => Number(b.rate) - Number(a.rate))

        if(recommendations.length > RECOMMENDATIONS_LIMIT) {
            return recommendations.slice(0, RECOMMENDATIONS_LIMIT)
        }

        return recommendations;
    },
    recommendBySVD: (ratesData, id) => {
        const matrix = (new Matrix(ratesData).trans()).data;
        const { u, q, v} = SVD(matrix);

        const matrixV = new Matrix(u).trans().data;
        const predictedRates = makePredictedRates(v, matrixV, q, id)
        // return predictedRates
        return makeRanking(predictedRates, ratesData, id)
    },
    recommendByReducedSVD: (ratesData, id) => {
        const matrix = (new Matrix(ratesData).trans()).data;
        const { u, q, v} = SVD(matrix);

        const newSigma = reduceSigmaEnergy(q)
        const newVMatrix = reduceUMatrix(u, newSigma)
        const newUMatrix = reduceVTMatrix(matrix, newVMatrix, newSigma)
        const newVTMatrix = new Matrix(newVMatrix).trans().data
        const predictedRates = makePredictedRates(newUMatrix, newVTMatrix, newSigma, id)

        return makeRanking(predictedRates, ratesData, id)
    }
}

const makePredictedRates = (UMatrix, VTMatrix, SigmaMatrix, id) => {
    const matrixU = new Matrix(UMatrix);
    const matrixV = new Matrix(VTMatrix);

    const matrixSigma = toDiagonalMatrix(SigmaMatrix, matrixU.cols, matrixV.rows);
    const newUserRow = new Matrix(UMatrix[id - 1])
    const userInNewSpace = rowByMatrix(newUserRow.data[0], matrixSigma.data);

    return rowByMatrix(userInNewSpace, matrixV.data);
}

const makeRanking = (predictedRates, ratesData, id) => {
    const ranking = predictedRates.filter(rate => rate !== 0).map((rate, index) => {
        return { id: index + 1, rate: Number(new Decimal(rate)) }
    });
    const sortedRanking = ranking.sort((a, b) => Number(new Decimal(b.rate)) - Number(new Decimal(a.rate)));
    const userRow = new Matrix(ratesData[id - 1]).data[0];
    const recommendations = [];
    sortedRanking.forEach((element) => {
        if(userRow[element.id - 1] === 0 && recommendations.length !== RECOMMENDATIONS_LIMIT) {
            recommendations.push(element);
        }
    })
    return recommendations;
}

const toDiagonalMatrix = (values, rows, columns) => {
    let diagonalMatrix = Matrix.zero(rows, columns);
    values.forEach((value, index) => {
        diagonalMatrix.data[index][index] = value;
    });
    return diagonalMatrix;
}

const rowByMatrix = (row, matrix) => {
    let resultMatrix = [];
    for ( let matrixCol = 0; matrixCol < matrix[0].length; matrixCol++ ) {
        let result = 0;
        for ( let matrixRow = 0; matrixRow < matrix.length; matrixRow++ ) {
            result += matrix[matrixRow][matrixCol] * row[matrixRow];
        }
        resultMatrix.push(result);
    }

    return resultMatrix;

}

const calculateVectorsSimilarity = (matrix, userId) => {
    const similarities = []
    for(let row = 0; row < matrix.length; row++) {
        let distance = null;
        for(let column = 0; column < matrix[row].length; column++) {
            if(matrix[row][column] !== 0 && matrix[userId][column] !== 0) { //we cannot calculate similarity with no rate
                let power = matrix[row][column] - matrix[userId][column]
                if(distance == null) {
                    distance = 0
                }
                distance += Math.pow(Math.abs(power), 2)
            }
        }
        if(distance === 0) { //for users which are the same
            similarities.push(1)
        } else if(distance === null) {
            similarities.push(0)
        } else {
            similarities.push(1 / Math.sqrt(distance))
        }
    }
    return similarities
}

const makePredictedValuesMatrix = (matrix, similarities) => {
    const predictedValuesMatrix = []

    for(let row = 0; row < matrix.length; row++) {
        const predictedValuesRow = [];

        for(let column = 0; column < matrix[row].length; column++) {
            predictedValuesRow.push(matrix[row][column] * similarities[row])
        }
        predictedValuesMatrix.push(predictedValuesRow)
    }
    return predictedValuesMatrix
}

const reduceSigmaEnergy = (Sigma) => {
    const fullEnergy = Sigma.reduce((a, b) => a + b, 0)
    let reducedEnergy = 0

    for(let i = 0; i < Sigma.length; i++) {
        reducedEnergy += Sigma[i]

        if(reducedEnergy >= fullEnergy * 0.9) {
            return Sigma.slice(0, i)
        }
    }
}
const reduceUMatrix = (U, reducedSigma) => {
    const newUMatrix = []
    U.forEach(row => {
         newUMatrix.push(row.slice(0, reducedSigma.length))
    })
    return newUMatrix
}

const multiplyMatrices = (a, b) => {
    var aNumRows = a.length, aNumCols = a[0].length,
        bNumRows = b.length, bNumCols = b[0].length,
        m = new Array(aNumRows);  // initialize array of rows
    for (var r = 0; r < aNumRows; ++r) {
        m[r] = new Array(bNumCols); // initialize the current row
        for (var c = 0; c < bNumCols; ++c) {
            m[r][c] = 0;             // initialize the current cell
            for (var i = 0; i < aNumCols; ++i) {
                m[r][c] += a[r][i] * b[i][c];
            }
        }
    }
    return m;
}
const reduceVTMatrix = (matrix, reducedUMatrix, reducedSigma) => {
    const transposedMatrix = new Matrix(matrix).trans()
    const temporaryMatrix = multiplyMatrices(transposedMatrix.data, reducedUMatrix)
    const reducedSigmaAsMatrix = toDiagonalMatrix(reducedSigma, reducedSigma.length, reducedSigma.length).data
    return multiplyMatrices(temporaryMatrix, reducedSigmaAsMatrix)
}
