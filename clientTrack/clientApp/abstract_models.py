import json
from django.forms import ValidationError
from django.http import JsonResponse
from django.shortcuts import get_object_or_404


def add(request, serializer):
    if request.method != 'POST':
        return JsonResponse({'error': "Only a POST method is allowed"}, status=405)
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': "Bad request, invalid JSON"}, status=400)

    try:
        validated_data = serializer(data=data)
        validated_data.is_valid(raise_exception=True)
        validated_data.save()
    except ValidationError:
        return JsonResponse({'error': validated_data.errors}, status=400)

    return JsonResponse(validated_data.data, status=200)

def get(request, model, serializer, id = None):
    if request.method != 'GET':
        return JsonResponse({'error': "Only a GET method is allowed"}, status=405)
    
    if id is not None:
        item = get_object_or_404(id=id)
        serialized_data = serializer(item).data
        return JsonResponse(serialized_data, status=200)
    else:
        item = model.objects.all()
        serialized_data = serializer(item, many=True).data
        return JsonResponse(serialized_data, status = 200)  

def update(request, model, serializer, id):
    if request.method != 'PUT':
        return JsonResponse({'error': "Only a PUT method is allowed"}, status=405) 
    
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': "Bad request, invalid JSON"}, status=400)
    
    item = get_object_or_404(model, id=id)
    serialized_data = serializer(item, data=data)
    if serialized_data.is_valid():
        serialized_data.save()
        return JsonResponse(serialized_data.data, status=200)

def delete(request, model, id):
    if request.method != 'DELETE':
        return JsonResponse({'error': "Only a DELETE method is allowed"}, status=405) 
    
    item = get_object_or_404(model, id=id)
    item.delete()
    return JsonResponse(f"item {id} deleted successfully!", status=200, safe=False)
