from ply import lex, yacc

# Tokens
tokens = (
    'INTEGER',
    'DECIMAL',
    'PLUS',
    'MINUS',
    'TIMES',
    'DIVIDE',
    'LPAREN',
    'RPAREN'
)

# Definición de los tokens
t_PLUS = r'\+'
t_MINUS = r'-'
t_TIMES = r'\*'
t_DIVIDE = r'/'
t_LPAREN = r'\('
t_RPAREN = r'\)'


# Manejar números decimales
def t_DECIMAL(t):
    r'\d+\.\d+'  
    t.value = float(t.value)  
    return t

# Manejar números enteros
def t_INTEGER(t):
    r'-?\d+'  
    t.value = int(t.value)  
    return t


t_ignore = ' \t'

# Manejar errores léxicos
def t_error(t):
    print(f"Illegal character '{t.value[0]}'")
    t.lexer.skip(1)

# Construcción del analizador léxico
lexer = lex.lex()

# Gramática
precedence = (
    ('left', 'PLUS', 'MINUS'),
    ('left', 'TIMES', 'DIVIDE'),
)

def p_expression_plus(p):
    "expression : expression PLUS term"
    p[0] = {"name": "+", "children": [p[1], p[3]]}


def p_expression_term(p):
    "expression : term"
    p[0] = p[1]

def p_term_times(p):
    "term : term TIMES factor"
    p[0] = {"name": "*", "children": [p[1], p[3]]}

def p_term_divide(p):
    "term : term DIVIDE factor"
    p[0] = {"name": "/", "children": [p[1], p[3]]}

def p_term_factor(p):
    "term : factor"
    p[0] = p[1]

# Diferenciar entre enteros y decimales
def p_factor_decimal(p):
    "factor : DECIMAL"
    p[0] = {"name": str(p[1]), "children": []}

def p_factor_integer(p):
    "factor : INTEGER"
    p[0] = {"name": str(p[1]), "children": []}

def p_factor_expr(p):
    "factor : LPAREN expression RPAREN"
    p[0] = p[2]

def p_error(p):
    print("Syntax error!")

# Construcción del analizador sintáctico
parser = yacc.yacc()

# Función para analizar tokens en la expresión
def analyze_tokens(expression):
    lexer.input(expression)
    tokens_list = []
    total_numbers = 0
    total_operators = 0

    for token in lexer:
        tokens_list.append({
            "type": token.type,
            "value": token.value
        })
        if token.type in ['INTEGER', 'DECIMAL']:
            total_numbers += 1
        elif token.type in ['PLUS', 'MINUS', 'TIMES', 'DIVIDE']:
            total_operators += 1

    return tokens_list, total_numbers, total_operators

# Evaluar la expresión y generar el árbol
def evaluate(expression):
    tokens, total_numbers, total_operators = analyze_tokens(expression)
    tree = parser.parse(expression) 
    result = eval_tree(tree)  
    return result, tree, tokens, total_numbers, total_operators

# Evaluar el árbol de sintaxis
def eval_tree(tree):
    if isinstance(tree, dict):
        operator = tree["name"]
        if operator in "+-*/":
            left = eval_tree(tree["children"][0])
            right = eval_tree(tree["children"][1])
            if operator == '+':
                return left + right
            elif operator == '-':
                return left - right
            elif operator == '*':
                return left * right
            elif operator == '/':
                if right == 0:
                    raise ZeroDivisionError("División por cero")
                return left / right
        else:
            return float(tree["name"]) if '.' in tree["name"] else int(tree["name"])  
    return tree

# Convertir el árbol a JSON
def tree_to_json(tree):
    return tree  

