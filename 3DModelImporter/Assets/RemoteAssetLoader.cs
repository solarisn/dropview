using UnityEngine;
using System.Collections;
using UnityEngine.Serialization;
using UnityEngine.Networking;
using System.Net;
using System.IO;
using System.Collections.Generic;
using System;

public class RemoteAssetLoader : MonoBehaviour {

	private bool readingInObject = false;
	private bool listeningForObj = false;
	private bool listeningForMtl = false;
	private bool listeningForTexture = false;

	public string directoryPath;
	public bool isLoaded;

	void Awake () {
		isLoaded = true;
	}

	// Use this for initialization
	void Start () {
		//StartCoroutine ("DownloadAsset");
		//StartCoroutine("GetAsset");
		StartCoroutine("RemoteSocketLoad");
	}
	
	// Update is called once per frame
	void Update () {
	
	}

	IEnumerator DownloadAsset() {
		Debug.Log ("Starting asset download");
		WWW www = new WWW ("http://localhost:1337/testobject.unity3d");
		yield return www;

		//Instantiate (www.assetBundle.mainAsset);
		Debug.Log(www);
		Debug.Log (www.assetBundle);
		Debug.Log (www.assetBundle.name);
		Debug.Log (www.assetBundle);
		Debug.Log ("New remote asset instantiated");
		Instantiate(www.assetBundle.LoadAsset<GameObject>(www.assetBundle.GetAllAssetNames ()[0]));
	}

	IEnumerator GetAsset() {

		WWW www = new WWW("http://localhost:1337/iPhone_6.obj");

		yield return www;

		//GameObject temp = ObjImporter.Import (www.text);

	}

	string materialString = null;
	string objectString = null;
	Texture2D[] textureArray = null;
	int textureIndex = 0;

	IEnumerator RemoteSocketLoad () {
		WebSocket w = new WebSocket(new Uri("ws://localhost:8001"));
		yield return StartCoroutine(w.Connect());
		int i = 0;
		while (true)
		{
			byte[] reply = w.Recv();
			if (reply != null) {
				string replyString = System.Text.Encoding.UTF8.GetString(reply, 0, reply.Length);
				if (replyString.Contains("START_OBJECT")) {
					Debug.Log ("Starting reading in object");
					readingInObject = true;
					int arrLength = Int32.Parse(replyString.Split (' ') [1]);
					textureArray = new Texture2D[arrLength];
				} else {
					switch (replyString) {
					case "incomingObj":
						listeningForObj = true;
						break;
					case "incomingMtl":
						listeningForMtl = true;
						break;
					case "incomingTexture":
						listeningForTexture = true;
						break;
					case "END_OBJECT":
						readingInObject = false;
						Debug.Log ("FULL OBJECT RECEIVED");
						yield return new WaitForSeconds (0.1f);
						Array.Reverse (textureArray);
						if (textureArray.Length > 0 && materialString != null) {
							GameObject temp = ObjImporter.Import (objectString, materialString, textureArray);
						} else if (textureArray.Length == 0 || materialString == null) {
							GameObject temp = ObjImporter.Import (objectString);
						}
						//GameObject temp = ObjImporter.Import (objectString, materialString, textureArray);
						materialString = null;
						objectString = null;
						textureIndex = 0;
						break;
					case "START_OBJECT":
						readingInObject = true;
						break;
					default:
						if (listeningForObj) {
							Debug.Log ("Mesh incoming...");
							Debug.Log ("Received: " + replyString);
							objectString = replyString;
							listeningForObj = false;
						} else if (listeningForMtl) {
							Debug.Log ("Material incoming...");
							Debug.Log ("Received: " + replyString);
							materialString = replyString;
							listeningForMtl = false;
						} else if (listeningForTexture) {
							Debug.Log ("Texture incoming...");
							Texture2D tempTexture = new Texture2D (1, 1);
							tempTexture.LoadImage (reply);
							textureArray[textureIndex] = tempTexture;
							//textureArray [i] = tempTexture; //OLD ARRAY IMPLEMENTATION
							//i++;
							textureIndex++;
							listeningForTexture = false;
						}
						break;
					}
				}
				/*
				if (replyString.Contains ("newmtl")) {
					Debug.Log ("Material incoming...");
					Debug.Log ("Received: "+replyString);
					materialString = replyString;
				} else if (replyString.Contains ("object")) {
					Debug.Log ("Mesh incoming...");
					Debug.Log ("Received: "+replyString);
					objectString = replyString;
				} else if (replyString == "END_TEXTURES") {
					Debug.Log ("ALL TEXTURES RECEIVED");
					Array.Reverse (textureArray);
					GameObject temp = ObjImporter.Import (objectString, materialString, textureArray);
				}
				else {
					Debug.Log ("Texture incoming...");
					Texture2D tempTexture = new Texture2D (1, 1);
					tempTexture.LoadImage (reply);
					textureArray [i] = tempTexture;
					i++;
				}
				*/

				//GameObject temp = ObjImporter.Import (reply);
				//MeshRenderer renderer = temp.GetComponent<MeshRenderer> ();
				//renderer.materials = DefineMaterial(
				//w.SendString("Hi there"+i++);
				//i++;
			}
			if (w.error != null)
			{
				Debug.LogError ("Error: "+w.error);
				break;
			}
			yield return null;
		}
		w.Close();
	}


	public void Load (string path, string filename) {
		if (!isLoaded)
			return;

		directoryPath = path;
		StartCoroutine (ConstructModel (filename));
	}

	IEnumerator ConstructModel (string filename) {

		isLoaded = false;

		FileReader.ObjectFile obj = FileReader.ReadObjectFile (directoryPath + filename);
		FileReader.MaterialFile mtl = FileReader.ReadMaterialFile (directoryPath + obj.mtllib);

		MeshFilter filter = gameObject.AddComponent<MeshFilter> ();
		MeshRenderer renderer = gameObject.AddComponent<MeshRenderer> ();

		filter.mesh = PopulateMesh (obj);
		renderer.materials = DefineMaterial (obj, mtl);

		isLoaded = true;
		yield return null;
	}

	Mesh PopulateMesh (FileReader.ObjectFile obj) {

		Mesh mesh = new Mesh ();

		List<int[]> triplets = new List<int[]> ();
		List<int> submeshes = new List<int> ();

		for (int i = 0; i < obj.f.Count; i += 1) {
			for (int j = 0; j < obj.f [i].Count; j += 1) {
				triplets.Add (obj.f [i] [j]);
			}
			submeshes.Add (obj.f [i].Count);
		}

		Vector3[] vertices = new Vector3[triplets.Count];
		Vector3[] normals = new Vector3[triplets.Count];
		Vector2[] uvs = new Vector2[triplets.Count];

		for (int i = 0; i < triplets.Count; i += 1) {
			vertices [i] = obj.v [triplets [i] [0] - 1];
			normals [i] = obj.vn [triplets [i] [2] - 1];
			if (triplets [i] [1] > 0)
				uvs [i] = obj.vt [triplets [i] [1] - 1];
		}

		mesh.name = obj.o;
		mesh.vertices = vertices;
		mesh.normals = normals;
		mesh.uv = uvs;
		mesh.subMeshCount = submeshes.Count;

		int vertex = 0;
		for (int i = 0; i < submeshes.Count; i += 1) {
			int[] triangles = new int[submeshes [i]];
			for (int j = 0; j < submeshes [i]; j += 1) {
				triangles [j] = vertex;
				vertex += 1;
			}
			mesh.SetTriangles (triangles, i);
		}

		mesh.RecalculateBounds ();
		mesh.Optimize ();

		return mesh;
	}
	



	Material[] DefineMaterial (FileReader.ObjectFile obj, FileReader.MaterialFile mtl) {

		Material[] materials = new Material[obj.usemtl.Count];

		for (int i = 0; i < obj.usemtl.Count; i += 1) {
			int index = mtl.newmtl.IndexOf (obj.usemtl [i]);

			Texture2D texture = new Texture2D (1, 1);
			texture.LoadImage (File.ReadAllBytes (directoryPath + mtl.mapKd [index]));

			materials [i] = new Material (Shader.Find ("Diffuse"));
			materials [i].name = mtl.newmtl [index];
			materials [i].mainTexture = texture;
		}

		return materials;
	}
}
