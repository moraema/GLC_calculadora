from flask import Flask, request, jsonify
from flask_cors import CORS
from app.evaluator import evaluate, tree_to_json


app = Flask(__name__)

CORS(app)


@app.route('/evaluate', methods=['POST'])
def process_expression():
    data = request.get_json() 
    expression = data.get('expression', '')
    
    try:
        
        result, tree = evaluate(expression)
        
        json_tree = tree_to_json(tree)
        
        return jsonify({
            'result': result,
            'syntax_tree': json_tree
        })
    
    except Exception as e:
        
        return jsonify({'error': str(e)}), 400

# Ejecutar la aplicación
if __name__ == '__main__':
    app.run(debug=True)
