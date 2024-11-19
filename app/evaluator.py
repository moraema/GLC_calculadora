from lark import Lark, Transformer, Tree, Token

# Definición la gramática en formato Lark
grammar = """
?start: expr
?expr: term
     | expr "+" term   -> add
     | expr "-" term   -> sub
?term: factor
     | term "*" factor -> mul
     | term "/" factor -> div
?factor: NUMBER        -> number
       | "(" expr ")"  -> parens
NUMBER: /\d+(\.\d+)?/
%ignore " "            // Ignorar espacios en blanco
"""

# Creación del parser utilizando Lark
parser = Lark(grammar, start='start', parser='lalr')

# Transformer para evaluar las expresiones
class EvalTransformer(Transformer):
    def add(self, args):
        return args[0] + args[1]

    def sub(self, args):
        return args[0] - args[1]

    def mul(self, args):
        return args[0] * args[1]

    def div(self, args):
        if args[1] == 0:
            raise ValueError("División por cero")
        return args[0] / args[1]

    def number(self, args):
        return float(args[0])

    def parens(self, args):
        return args[0]  

# Función para convertir el árbol de sintaxis en formato JSON
def tree_to_json(tree):
    rename_map = {
        "add": "+",
        "sub": "-",
        "mul": "*",
        "div": "/",
        "number": "n",
        "parens": "()"
    }
    
    if isinstance(tree, Token):
        return {"name": tree.value}  
    
    elif isinstance(tree, Tree):
        node_name = rename_map.get(tree.data, tree.data)  
        return {
            "name": node_name,
            "children": [tree_to_json(child) for child in tree.children] 
        }

# Función para evaluar una expresión
def evaluate(expression):
    tree = parser.parse(expression)  
    result = EvalTransformer().transform(tree)  
    return result, tree
