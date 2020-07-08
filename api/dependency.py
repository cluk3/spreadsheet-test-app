def create_dependency_graph(dep_list):
    graph = dict()
    for dep in dep_list:
        x = graph.get((dep.dependent_col, dep.dependent_row))
        if x is None:
            graph[(dep.dependent_col, dep.dependent_row)] = [(dep.dependee_col, dep.dependee_row)]
        else:
            x.append((dep.dependee_col, dep.dependee_row))
    return graph

def cyclic(graph):
    visited = set()
    path = set()

    def explore(node):
        if node in visited:
            return False
        visited.add(node)
        path.add(node)
        for neighbour in graph.get(node, ()):
            if neighbour in path or explore(neighbour):
                return True
        path.remove(node)
        return False
    
    for node in graph:
        explore(node)
    
    return path